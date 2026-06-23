const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getOwnStays,
  getAllStays,
  endStay,
  earlyDeparture,
  createStay,
} = require('../controllers/stayController');

const router = express.Router();

// Student routes
router.get('/me', authMiddleware, getOwnStays);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllStays);
router.post('/admin/create', authMiddleware, adminMiddleware, createStay);
router.patch('/admin/:id/end', authMiddleware, adminMiddleware, endStay);
router.patch('/admin/:id/leave-early', authMiddleware, adminMiddleware, earlyDeparture);


module.exports = router;
