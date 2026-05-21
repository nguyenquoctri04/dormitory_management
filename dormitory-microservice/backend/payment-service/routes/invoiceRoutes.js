const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createInvoice,
  getOwnInvoices,
  getInvoiceDetails,
  markInvoicePaid,
  getAllInvoices,
  getInvoiceDetailsAdmin,
} = require('../controllers/invoiceController');

const router = express.Router();

// Student routes
router.post('/', authMiddleware, createInvoice);
router.get('/me', authMiddleware, getOwnInvoices);
router.get('/:id', authMiddleware, getInvoiceDetails);
router.patch('/:id/pay', authMiddleware, markInvoicePaid);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllInvoices);
router.get('/admin/:id', authMiddleware, adminMiddleware, getInvoiceDetailsAdmin);

module.exports = router;
