const prisma = require('../lib/prismaClient');

// GET /api/v1/invoices/me - Get own invoices
const getOwnInvoices = async (req, res) => {
  try {
    const student_id = req.user?.id;
    const { status, type, year, month } = req.query;

    const where = { studentId: student_id };
    if (status) where.status = status;
    if (type) where.type = type;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        room: true,
        utility: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/invoices/:id - Get invoice details
const getInvoiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        room: true,
        utility: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Only owner or admin can view
    if (invoice.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/invoices - Get all invoices (Admin only)
const getAllInvoices = async (req, res) => {
  try {
    const { status, type, room_id, year, month } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (room_id) where.roomId = parseInt(room_id);
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        room: true,
        utility: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/invoices/:id - Get invoice details (Admin only)
const getInvoiceDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        room: true,
        utility: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/admin/invoices/room-fee - Create room fee invoice (Admin only)
const createRoomFeeInvoice = async (req, res) => {
  try {
    const { registration_id, student_id, room_id, amount, month, year } = req.body;

    if (!student_id || !room_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId: parseInt(student_id),
        roomId: parseInt(room_id),
        type: 'ROOM_FEE',
        registrationId: registration_id ? parseInt(registration_id) : null,
        amount: parseFloat(amount),
        status: 'UNPAID',
        month: month ? parseInt(month) : new Date().getMonth() + 1,
        year: year ? parseInt(year) : new Date().getFullYear(),
      },
    });

    res.status(201).json({ message: 'Room fee invoice created', invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/admin/invoices/utilities-generate - Generate utility invoices (Admin only)
const generateUtilityInvoices = async (req, res) => {
  try {
    const { utility_id } = req.body;

    if (!utility_id) {
      return res.status(400).json({ error: 'utility_id is required' });
    }

    const utility = await prisma.utility.findUnique({
      where: { id: parseInt(utility_id) },
    });

    if (!utility) {
      return res.status(404).json({ error: 'Utility record not found' });
    }

    // Find all active stays in this room during this month
    const startDate = new Date(utility.year, utility.month - 1, 1);
    const endDate = new Date(utility.year, utility.month, 0, 23, 59, 59);

    const stays = await prisma.stay.findMany({
      where: {
        roomId: utility.roomId,
        status: { in: ['ACTIVE', 'ENDED'] },
        startDate: { lte: endDate },
        OR: [{ endDate: null }, { endDate: { gte: startDate } }],
      },
    });

    if (stays.length === 0) {
      return res.status(400).json({ error: 'No active stays in this room for this month' });
    }

    // Calculate per-person amount
    const amountPerPerson = utility.totalAmount / stays.length;

    // Create invoices for each resident
    const invoices = [];
    for (const stay of stays) {
      // Check if invoice already exists
      const existing = await prisma.invoice.findFirst({
        where: {
          studentId: stay.studentId,
          utilityId: parseInt(utility_id),
        },
      });

      if (!existing) {
        const invoice = await prisma.invoice.create({
          data: {
            studentId: stay.studentId,
            roomId: utility.roomId,
            type: 'UTILITY',
            utilityId: parseInt(utility_id),
            amount: amountPerPerson,
            status: 'UNPAID',
            month: utility.month,
            year: utility.year,
          },
        });
        invoices.push(invoice);
      }
    }

    res.status(201).json({
      message: `${invoices.length} utility invoices generated`,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOwnInvoices,
  getInvoiceDetails,
  getAllInvoices,
  getInvoiceDetailsAdmin,
  createRoomFeeInvoice,
  generateUtilityInvoices,
};
