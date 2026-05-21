const prisma = require('../lib/prismaClient');

const createUtility = async (req, res) => {
  try {
    const { room_id, month, year, electricity_index, water_index, total_amount } = req.body;

    if (!room_id || !month || !year || electricity_index == null || water_index == null || total_amount == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const utility = await prisma.utility.create({
      data: {
        roomId: parseInt(room_id),
        month: parseInt(month),
        year: parseInt(year),
        electricityIndex: parseInt(electricity_index),
        waterIndex: parseInt(water_index),
        totalAmount: total_amount,
      },
    });

    res.status(201).json({ message: 'Utility record created', utility });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getOwnUtilities = async (req, res) => {
  try {
    const { room_id } = req.query;
    const where = {};

    if (room_id) {
      where.roomId = parseInt(room_id);
    }

    const utilities = await prisma.utility.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(utilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getUtilityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const utility = await prisma.utility.findUnique({
      where: { id: parseInt(id) },
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

const getAllUtilities = async (req, res) => {
  try {
    const { room_id, month, year } = req.query;
    const where = {};

    if (room_id) where.roomId = parseInt(room_id);
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const utilities = await prisma.utility.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(utilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getUtilityDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const utility = await prisma.utility.findUnique({
      where: { id: parseInt(id) },
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

const updateUtility = async (req, res) => {
  try {
    const { id } = req.params;
    const { electricity_index, water_index, total_amount } = req.body;

    const utility = await prisma.utility.update({
      where: { id: parseInt(id) },
      data: {
        electricityIndex: electricity_index != null ? parseInt(electricity_index) : undefined,
        waterIndex: water_index != null ? parseInt(water_index) : undefined,
        totalAmount: total_amount != null ? total_amount : undefined,
      },
    });

    res.json({ message: 'Utility record updated', utility });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUtility,
  getOwnUtilities,
  getUtilityDetails,
  getAllUtilities,
  getUtilityDetailsAdmin,
  updateUtility,
};
