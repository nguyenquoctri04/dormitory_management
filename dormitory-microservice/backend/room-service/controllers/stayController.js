const prisma = require('../lib/prismaClient');
const { publishMessage } = require('../lib/rabbitmq');

// GET /api/v1/stays/me - Get own stays
const getOwnStays = async (req, res) => {
  try {
    const student_id = req.user?.id;
    const { status } = req.query;

    const where = { studentId: student_id };
    if (status) where.status = status;

    const stays = await prisma.stay.findMany({
      where,
      include: {
        room: true,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(stays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/stays - Get all stays (Admin only)
const getAllStays = async (req, res) => {
  try {
    const { status, room_id, student_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (room_id) where.roomId = room_id;
    if (student_id) where.studentId = student_id;

    const stays = await prisma.stay.findMany({
      where,
      include: {
        room: true,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(stays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/stays/:id/end - End stay (Admin only)
const endStay = async (req, res) => {
  try {
    const { id } = req.params;

    const stay = await prisma.stay.findUnique({
      where: { id },
    });

    if (!stay) {
      return res.status(404).json({ error: 'Stay not found' });
    }

    if (stay.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE stays can be ended' });
    }

    const updated = await prisma.stay.update({
      where: { id },
      data: {
        endDate: new Date(),
        status: 'ENDED',
      },
    });

    // PUBLISH EVENT for other services to release registration
    await publishMessage('stay_events', 'stay.updated', {
      stayId: updated.id,
      studentId: updated.studentId,
      status: 'ENDED'
    });

    res.json({ message: 'Stay ended', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/stays/:id/leave-early - Early departure (Admin only)
const earlyDeparture = async (req, res) => {
  try {
    const { id } = req.params;

    const stay = await prisma.stay.findUnique({
      where: { id },
    });

    if (!stay) {
      return res.status(404).json({ error: 'Stay not found' });
    }

    if (stay.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE stays can be ended' });
    }

    const updated = await prisma.stay.update({
      where: { id },
      data: {
        endDate: new Date(),
        status: 'LEFT_EARLY',
      },
    });

    // PUBLISH EVENT for other services to release registration
    await publishMessage('stay_events', 'stay.updated', {
      stayId: updated.id,
      studentId: updated.studentId,
      status: 'LEFT_EARLY'
    });

    res.json({ message: 'Early departure recorded', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/stays/admin/create - Create stay (Internal/Admin only)
const createStay = async (req, res) => {
  try {
    const { student_id, room_id, period_id, start_date, end_date, registration_date, academic_year, semester } = req.body;

    if (!student_id || !room_id || !period_id || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stay = await prisma.stay.create({
      data: {
        studentId: student_id,
        roomId: room_id,
        periodId: period_id,
        startDate: new Date(start_date),
        endDate: end_date ? new Date(end_date) : null,
        registrationDate: registration_date ? new Date(registration_date) : null,
        academicYear: academic_year || null,
        semester: semester || null,
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ message: 'Stay created', stay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getOwnStays,
  getAllStays,
  endStay,
  earlyDeparture,
  createStay,
};

