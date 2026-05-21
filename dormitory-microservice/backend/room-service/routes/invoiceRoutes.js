const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getOwnInvoices,
  getInvoiceDetails,
  getAllInvoices,
  getInvoiceDetailsAdmin,
  createRoomFeeInvoice,
  generateUtilityInvoices,
} = require('../controllers/invoiceController');

const router = express.Router();

// Student routes
router.get('/me', authMiddleware, getOwnInvoices);
router.get('/:id', authMiddleware, getInvoiceDetails);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllInvoices);
router.get('/admin/:id', authMiddleware, adminMiddleware, getInvoiceDetailsAdmin);
router.post('/admin/room-fee', authMiddleware, adminMiddleware, createRoomFeeInvoice);
router.post('/admin/utilities-generate', authMiddleware, adminMiddleware, generateUtilityInvoices);

module.exports = router;
