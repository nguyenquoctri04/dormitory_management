const prisma = require('../lib/prismaClient');

const createInvoice = async (req, res) => {
  try {
    const { student_id, room_id, type, amount, month, year, registration_id, utility_id } = req.body;
    const requesterId = req.user?.id;

    if (!student_id || !room_id || !type || amount == null || month == null || year == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (requesterId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId: student_id,
        roomId: room_id,
        type,
        registrationId: registration_id || null,
        utilityId: utility_id || null,
        amount: parseFloat(amount),
        status: 'UNPAID',
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getOwnInvoices = async (req, res) => {
  try {
    const student_id = req.user?.id;

    const invoices = await prisma.invoice.findMany({
      where: { studentId: student_id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const markInvoicePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (invoice.status !== 'UNPAID') {
      return res.status(400).json({ error: 'Only UNPAID invoices can be marked paid' });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: 'PAID' },
    });

    res.json({ message: 'Invoice marked as paid', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const { status, student_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (student_id) where.studentId = student_id;

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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

module.exports = {
  createInvoice,
  getOwnInvoices,
  getInvoiceDetails,
  markInvoicePaid,
  getAllInvoices,
  getInvoiceDetailsAdmin,
};
