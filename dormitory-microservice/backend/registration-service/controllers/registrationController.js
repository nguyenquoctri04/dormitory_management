const prisma = require('../lib/prismaClient');
const { publishMessage } = require('../lib/rabbitmq');



// POST /api/v1/registrations - Create registration
const createRegistration = async (req, res) => {
  try {
    const { requested_room_type, requested_gender, period_id, start_date, end_date, type, room_id, academic_year, semester, payment_method } = req.body;
    const student_id = req.user?.id;

    if (!requested_room_type || !requested_gender || !period_id || !start_date || !end_date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. STRICTOR CHECK: Block if student has ANY active/valid registration record
    // This includes: PENDING (Cash/VNPay paid), WAITING_PAYMENT (VNPay pending), APPROVED (Ready to check-in), COMPLETED (Already checked-in)
    // We check for ANY semester if they are currently residing or have an approved slot.
    const activeReg = await prisma.registration.findFirst({
      where: {
        studentId: student_id,
        status: { in: ['PENDING', 'WAITING_PAYMENT', 'APPROVED', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' }
    });

    if (activeReg) {
      let statusMsg = '';
      switch(activeReg.status) {
        case 'PENDING': statusMsg = 'đang chờ xử lý'; break;
        case 'WAITING_PAYMENT': statusMsg = 'đang chờ thanh toán'; break;
        case 'APPROVED': statusMsg = 'đã được duyệt'; break;
        case 'COMPLETED': statusMsg = 'đã hoàn tất (bạn đang cư trú)'; break;
      }
      return res.status(400).json({ error: `Bạn không thể đăng ký thêm vì đang có đơn ${statusMsg}.` });
    }

    // 2. New Self-Healing Logic: Verify Real-time Active Stay Status
    // We trust Room Service more than our own records for "already occupied" status.
    let hasActiveStay = false;
    try {
      const stayUrl = `http://room-service:3003/api/v1/stays/admin/list?student_id=${student_id}&status=ACTIVE`;
      const stayResponse = await fetch(stayUrl, {
        headers: { 'Authorization': `Bearer ${process.env.INTERNAL_TOKEN || 'internal-secret'}` }
      });
      if (stayResponse.ok) {
        const activeStays = await stayResponse.json();
        if (activeStays && activeStays.length > 0) {
          hasActiveStay = true;
        }
      }
    } catch (err) {
      console.error('⚠️ Could not verify active stay with Room Service:', err.message);
      // Fallback: If room service is unreachable, we check if there's an APPROVED/COMPLETED reg
      const backupCheck = await prisma.registration.findFirst({
        where: {
          studentId: student_id,
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
      });
      if (backupCheck) hasActiveStay = true;
    }

    if (hasActiveStay) {
      return res.status(400).json({ error: 'Bạn hiện đang có một lượt ở đang hoạt động. Vui lòng hoàn tất hoặc kết thúc lượt ở trước khi đăng ký mới.' });
    }

    // Strict detector
    const isVnpay = String(req.body.payment_method || req.body.paymentMethod || '').toUpperCase().includes('VNPAY');

    const registration = await prisma.registration.create({
      data: {
        studentId: student_id,
        requestedRoomType: requested_room_type,
        requestedGender: requested_gender,
        roomId: room_id || null,
        periodId: period_id,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        type,
        status: isVnpay ? 'WAITING_PAYMENT' : 'PENDING',
        paymentMethod: isVnpay ? 'VNPAY' : 'CASH',
        academicYear: academic_year,
        semester: semester,
        registrationDate: new Date(),
      },
    });

    // PUBLISH EVENT for Invoice Creation
    // We'll pass the amount if provided, or something to help payment-service calculate
    await publishMessage('registration_events', 'registration.created', {
      registrationId: registration.id,
      studentId: registration.studentId,
      roomId: registration.roomId,
      amount: req.body.amount, // Expecting frontend to send this now
      academicYear: registration.academicYear,
      semester: registration.semester,
      paymentMethod: registration.paymentMethod
    });

    res.status(201).json({ message: 'Registration created', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/registrations/me - Get own registrations
const getOwnRegistrations = async (req, res) => {
  try {
    const student_id = req.user?.id;

    const registrations = await prisma.registration.findMany({
      where: { studentId: student_id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/registrations/:id - Get registration details
const getRegistrationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/registrations/:id/cancel - Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.studentId !== student_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Allow cancelling PENDING (cash) and WAITING_PAYMENT (incomplete VNPay)
    if (!['PENDING', 'WAITING_PAYMENT'].includes(registration.status)) {
      return res.status(400).json({ error: `Không thể hủy đơn ở trạng thái "${registration.status}". Chỉ có thể hủy đơn đang chờ xử lý.` });
    }

    // For WAITING_PAYMENT (incomplete VNPay), just delete the record entirely so student can re-register
    if (registration.status === 'WAITING_PAYMENT') {
      await prisma.registration.delete({ where: { id } });
      return res.json({ message: 'Registration cancelled and removed (incomplete payment)' });
    }

    // For PENDING (cash), mark as REJECTED
    const updated = await prisma.registration.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json({ message: 'Registration cancelled', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/registrations - Get all registrations (Admin only)
const getAllRegistrations = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/registrations/:id - Get registration details (Admin only)
const getRegistrationDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/registrations/:id/approve - Approve registration (Admin only)
const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id } = req.body;

    if (!room_id) {
      return res.status(400).json({ error: 'room_id is required' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING registrations can be approved' });
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        status: 'APPROVED',
        roomId: room_id,
      },
    });

    // PUBLISH EVENT for Payment Confirmation (In-person flow)
    await publishMessage('registration_events', 'registration.approved', {
      registrationId: updated.id,
      studentId: updated.studentId,
      status: 'APPROVED'
    });

    res.json({ message: 'Registration approved', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// PATCH /api/v1/admin/registrations/:id/reject - Reject registration (Admin only)
const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING registrations can be rejected' });
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejection_reason || 'Bị từ chối bởi nhân viên quản lý',
      },
    });

    // PUBLISH EVENT for Payment Service to cleanup invoices
    await publishMessage('registration_events', 'registration.rejected', {
      registrationId: updated.id,
      studentId: updated.studentId
    });

    res.json({ message: 'Registration rejected', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createRegistration,
  getOwnRegistrations,
  getRegistrationDetails,
  cancelRegistration,
  getAllRegistrations,
  getRegistrationDetailsAdmin,
  approveRegistration,
  rejectRegistration,
};
