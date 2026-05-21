const prisma = require('../lib/prismaClient');

// POST /api/v1/registrations - Create registration
const createRegistration = async (req, res) => {
  try {
    const { requested_room_type, requested_gender, period_id, start_date, end_date, type, room_id } = req.body;
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
        roomId: room_id ? parseInt(room_id) : null,
        periodId: parseInt(period_id),
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        type,
        status: 'PENDING',
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING registrations can be approved' });
    }

    const updated = await prisma.registration.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVED',
        roomId: parseInt(room_id),
      },
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

    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(id) },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING registrations can be rejected' });
    }

    const updated = await prisma.registration.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' },
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
