const prisma = require('../lib/prismaClient');

const buildRegistrationCheck = async (registration_id, authHeader) => {
  const registrationServiceUrl = process.env.REGISTRATION_SERVICE_URL;
  if (!registrationServiceUrl) {
    return null;
  }

  const response = await fetch(`${registrationServiceUrl}/api/v1/registrations/${registration_id}`, {
    headers: {
      Authorization: authHeader || '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to validate registration via registration service');
  }

  return response.json();
};

// POST /api/v1/payments - Create payment for registration
const createPayment = async (req, res) => {
  try {
    const registration_id = req.body.registration_id || req.body.registrationId;
    const invoice_id = req.body.invoice_id || req.body.invoiceId;
    const amount = req.body.amount;
    const payment_method = req.body.payment_method || req.body.paymentMethod;
    const student_id = req.user?.id;
    const authHeader = req.headers.authorization;

    if ((!registration_id && !invoice_id) || !amount) {
      return res.status(400).json({ error: 'Missing registration_id/invoice_id or amount' });
    }

    let registration = null;
    if (registration_id) {
        try {
            registration = await buildRegistrationCheck(registration_id, authHeader);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        if (registration) {
            if (registration.studentId !== student_id) {
                return res.status(403).json({ error: 'Access denied' });
            }
            if (registration.status !== 'APPROVED') {
                return res.status(400).json({ error: 'Registration must be APPROVED to make payment' });
            }
        }

        const existingPayment = await prisma.payment.findUnique({
            where: { registrationId: registration_id },
        });

        if (existingPayment) {
            return res.status(400).json({ error: 'Payment already exists for this registration' });
        }
    }

    // IF VNPAY -> We should use the specialized VNPay logic
    if (payment_method === 'VNPAY') {
        const vnpay = require('./vnpayController');
        req.body.registrationId = registration_id;
        req.body.invoiceId = invoice_id; 
        req.body.roomId = registration?.roomId || null; // Pass roomId if we have it
        return vnpay.createPaymentUrl(req, res);
    }

    const payment = await prisma.payment.create({
      data: {
        registrationId: registration_id || null,
        invoiceId: invoice_id || null,
        studentId: student_id,
        roomId: registration?.roomId || null,
        amount: parseFloat(amount),
        status: 'PENDING',
        paymentMethod: payment_method || 'CASH',
      },
    });


    res.status(201).json({ message: 'Payment created', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/payments/me - Get own payments
const getOwnPayments = async (req, res) => {
  try {
    const student_id = req.user?.id;

    const payments = await prisma.payment.findMany({
      where: { studentId: student_id },
      orderBy: { id: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/payments/:id - Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/payments/:id/confirm - Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING payments can be confirmed' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paymentDate: new Date() },
    });

    res.json({ message: 'Payment confirmed', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/payments/:id/fail - Mark payment as failed
const failPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING payments can be marked as failed' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'FAILED' },
    });

    res.json({ message: 'Payment marked as failed', updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/payments - Get all payments (Admin only)
const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) where.status = status;
    
    // Exclude VNPay payments from Admin view as per requirement
    where.paymentMethod = { not: 'VNPAY' };

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { id: 'desc' },
    });


    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/payments/:id - Get payment details (Admin only)
const getPaymentDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPayment,
  getOwnPayments,
  getPaymentDetails,
  confirmPayment,
  failPayment,
  getAllPayments,
  getPaymentDetailsAdmin,
};
