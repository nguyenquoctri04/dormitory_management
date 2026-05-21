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

const router = express.Router();

// Student routes
router.post('/', authMiddleware, createPayment);
router.get('/me', authMiddleware, getOwnPayments);
router.get('/:id', authMiddleware, getPaymentDetails);
router.patch('/:id/confirm', authMiddleware, confirmPayment);
router.patch('/:id/fail', authMiddleware, failPayment);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllPayments);
router.get('/admin/:id', authMiddleware, adminMiddleware, getPaymentDetailsAdmin);

module.exports = router;
