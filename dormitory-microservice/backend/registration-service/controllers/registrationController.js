const prisma = require('../lib/prismaClient');

const createStayRecord = async (data, authHeader) => {
  const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:3003';
  
  try {
    const response = await fetch(`${roomServiceUrl}/api/v1/stays/admin/create`, {
      method: 'POST',
      headers: {
        Authorization: authHeader || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create stay record in room service');
    }

    return response.json();
  } catch (error) {
    console.error('Inter-service error (Room Service):', error);
    throw error;
  }
};


// POST /api/v1/registrations - Create registration
const createRegistration = async (req, res) => {
  try {
    const { requested_room_type, requested_gender, period_id, start_date, end_date, type, room_id, academic_year, semester } = req.body;
    const student_id = req.user?.id;

    if (!requested_room_type || !requested_gender || !period_id || !start_date || !end_date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activeReg = await prisma.registration.findFirst({
      where: {
        studentId: student_id,
        status: { in: ['PENDING', 'APPROVED', 'WAITING_PAYMENT'] },
      },
    });

    if (activeReg) {
      return res.status(400).json({ error: 'Student already has an active registration' });
    }

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
        status: 'PENDING',
        academicYear: academic_year,
        semester: semester,
      },
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

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only cancel PENDING registrations' });
    }

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

    if (status) where.status = status;

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

    // Notify room service to create a Stay
    try {
      await createStayRecord({
        student_id: registration.studentId,
        room_id: room_id,
        period_id: registration.periodId,
        start_date: registration.startDate,
        end_date: registration.endDate,
      }, req.headers.authorization);
    } catch (stayError) {
      console.warn('Stay creation failed, but registration was approved:', stayError.message);
      // We don't rollback registration approval because stay can be created manually if needed, 
      // but you might want to handle this differently in production.
    }

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
        rejectionReason: rejection_reason || null,
      },
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
