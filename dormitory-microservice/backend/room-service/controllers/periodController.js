const prisma = require('../lib/prismaClient');

// GET /api/v1/periods - List all periods
const listPeriods = async (req, res) => {
  try {
    const periods = await prisma.period.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(periods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/periods/:id - Get period details
const getPeriodDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const period = await prisma.period.findUnique({
      where: { id: parseInt(id) },
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    res.json(period);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/admin/periods - Create period (Admin only)
const createPeriod = async (req, res) => {
  try {
    const { name, duration_months } = req.body;

    if (!name || duration_months === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const period = await prisma.period.create({
      data: {
        name,
        durationMonths: parseInt(duration_months),
      },
    });

    res.status(201).json({ message: 'Period created', period });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/periods/:id - Update period (Admin only)
const updatePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration_months } = req.body;

    const period = await prisma.period.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : undefined,
        durationMonths: duration_months !== undefined ? parseInt(duration_months) : undefined,
      },
    });

    res.json({ message: 'Period updated', period });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/v1/admin/periods/:id - Delete period (Admin only)
const deletePeriod = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.period.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Period deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listPeriods,
  getPeriodDetails,
  createPeriod,
  updatePeriod,
  deletePeriod,
};
