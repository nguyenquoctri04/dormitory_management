const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createPayment,
  getOwnPayments,
  getPaymentDetails,
  confirmPayment,
  failPayment,
  getAllPayments,
  getPaymentDetailsAdmin,
} = require('../controllers/paymentController');
const { createPaymentUrl, vnpayIpn, rollbackPayment, confirmVnpayPayment } = require('../controllers/vnpayController');

const router = express.Router();

// ⚠️ Static/named routes MUST be declared before /:id wildcard routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllPayments);
router.get('/admin/:id', authMiddleware, adminMiddleware, getPaymentDetailsAdmin);

// VNPay special routes
router.post('/vnpay/create-url', authMiddleware, createPaymentUrl);
router.post('/vnpay/confirm', authMiddleware, confirmVnpayPayment);   // NEW: frontend confirms after redirect
router.post('/vnpay/rollback', authMiddleware, rollbackPayment);
router.get('/vnpay/ipn', vnpayIpn); // IPN from VNPay server (no auth, signature verified internally)

// Student routes
router.post('/', authMiddleware, createPayment);
router.get('/me', authMiddleware, getOwnPayments);
router.get('/:id', authMiddleware, getPaymentDetails);
router.patch('/:id/confirm', authMiddleware, confirmPayment);
router.patch('/:id/fail', authMiddleware, failPayment);

module.exports = router;
