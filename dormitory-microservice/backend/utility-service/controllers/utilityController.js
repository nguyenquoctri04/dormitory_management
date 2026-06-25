const prisma = require('../lib/prismaClient');
const { publishMessage } = require('../lib/rabbitmq');

const createUtility = async (req, res) => {
  try {
    const { room_id, month, year, electricity_index, water_index } = req.body;

    if (!room_id || !month || !year || electricity_index == null || water_index == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Fetch Previous Month's Utility Record to calculate usage
    // We look for the most recent record before this month/year for this room
    const prevUtility = await prisma.utility.findFirst({
        where: { roomId: room_id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    const prevElec = prevUtility ? prevUtility.electricityIndex : 0;
    const prevWater = prevUtility ? prevUtility.waterIndex : 0;

    const electricityUsage = Math.max(0, parseInt(electricity_index) - prevElec);
    const waterUsage = Math.max(0, parseInt(water_index) - prevWater);

    // 2. Constants for Pricing
    const ELEC_PRICE = 3000;
    const WATER_PRICE = 12000;
    const totalAmount = (electricityUsage * ELEC_PRICE) + (waterUsage * WATER_PRICE);

    // 3. Create Utility Record
    const utility = await prisma.utility.create({
      data: {
        roomId: room_id,
        month: parseInt(month),
        year: parseInt(year),
        electricityIndex: parseInt(electricity_index),
        waterIndex: parseInt(water_index),
        electricityUsage,
        waterUsage,
        totalAmount,
        status: 'UNPAID'
      },
    });

    // 4. PUBLISH EVENT for Payment Service to Create Split Invoices
    await publishMessage('registration_events', 'utility.created', {
        utilityId: utility.id,
        roomId: utility.roomId,
        month: utility.month,
        year: utility.year,
        totalAmount: utility.totalAmount
    });

    res.status(201).json({ message: 'Utility record created and pending split invoices', utility });
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
      where.roomId = room_id;
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
      where: { id },
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

    if (room_id) where.roomId = room_id;
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
      where: { id },
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
      where: { id },
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
