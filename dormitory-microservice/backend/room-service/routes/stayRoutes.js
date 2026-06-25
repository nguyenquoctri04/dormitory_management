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
const {
  requestEarlyDeparture,
  getAllRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/earlyDepartureController');

const router = express.Router();

// Student routes
router.get('/me', authMiddleware, getOwnStays);
router.post('/early-departure', authMiddleware, requestEarlyDeparture);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllStays);
router.post('/admin/create', authMiddleware, adminMiddleware, createStay);
router.patch('/admin/:id/end', authMiddleware, adminMiddleware, endStay);
router.patch('/admin/:id/leave-early', authMiddleware, adminMiddleware, earlyDeparture);

// Early Departure Request Admin routes
router.get('/admin/early-departures', authMiddleware, adminMiddleware, getAllRequests);
router.patch('/admin/early-departures/:id/approve', authMiddleware, adminMiddleware, approveRequest);
router.patch('/admin/early-departures/:id/reject', authMiddleware, adminMiddleware, rejectRequest);


module.exports = router;
