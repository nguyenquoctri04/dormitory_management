const prisma = require('../lib/prismaClient');

// POST /api/v1/admin/utilities - Record utility index (Admin only)
const createUtility = async (req, res) => {
  try {
    const { room_id, month, year, electricity_index, water_index, total_amount } = req.body;

    if (!room_id || !month || !year || electricity_index === undefined || water_index === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate (room_id, month, year)
    const existing = await prisma.utility.findFirst({
      where: {
        roomId: room_id,
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Utility record already exists for this room in this month' });
    }

    const utility = await prisma.utility.create({
      data: {
        roomId: room_id,
        month: parseInt(month),
        year: parseInt(year),
        electricityIndex: parseInt(electricity_index),
        waterIndex: parseInt(water_index),
        totalAmount: parseFloat(total_amount) || 0,
      },
    });

    res.status(201).json({ message: 'Utility record created', utility });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/utilities - Get all utilities (Admin only)
const listUtilities = async (req, res) => {
  try {
    const { room_id, month, year } = req.query;
    const where = {};

    if (room_id) where.roomId = room_id;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const utilities = await prisma.utility.findMany({
      where,
      include: {
        room: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(utilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/utilities/:id - Get utility details (Admin only)
const getUtilityDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const utility = await prisma.utility.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!utility) {
      return res.status(404).json({ error: 'Utility record not found' });
    }

    res.json(utility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/utilities/:id - Update utility (Admin only)
const updateUtility = async (req, res) => {
  try {
    const { id } = req.params;
    const { electricity_index, water_index, total_amount } = req.body;

    const utility = await prisma.utility.update({
      where: { id },
      data: {
        electricityIndex: electricity_index !== undefined ? parseInt(electricity_index) : undefined,
        waterIndex: water_index !== undefined ? parseInt(water_index) : undefined,
        totalAmount: total_amount !== undefined ? parseFloat(total_amount) : undefined,
      },
    });

    res.json({ message: 'Utility updated', utility });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUtility,
  listUtilities,
  getUtilityDetails,
  updateUtility,
};
