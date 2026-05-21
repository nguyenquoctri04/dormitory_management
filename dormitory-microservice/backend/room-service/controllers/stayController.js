const prisma = require('../lib/prismaClient');

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
    const { status, room_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (room_id) where.roomId = parseInt(room_id);

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
      where: { id: parseInt(id) },
    });

    if (!stay) {
      return res.status(404).json({ error: 'Stay not found' });
    }

    if (stay.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE stays can be ended' });
    }

    const updated = await prisma.stay.update({
      where: { id: parseInt(id) },
      data: {
        endDate: new Date(),
        status: 'ENDED',
      },
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
      where: { id: parseInt(id) },
    });

    if (!stay) {
      return res.status(404).json({ error: 'Stay not found' });
    }

    if (stay.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE stays can be ended' });
    }

    const updated = await prisma.stay.update({
      where: { id: parseInt(id) },
      data: {
        endDate: new Date(),
        status: 'LEFT_EARLY',
      },
    });

    res.json({ message: 'Early departure recorded', updated });
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
};
