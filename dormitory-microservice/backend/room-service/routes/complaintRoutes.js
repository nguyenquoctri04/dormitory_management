const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  submitComplaint,
  getOwnComplaints,
  getComplaintDetails,
  getAllComplaints,
  getComplaintDetailsAdmin,
  updateComplaintStatus,
} = require('../controllers/complaintController');

const router = express.Router();

// Student routes
router.post('/', authMiddleware, submitComplaint);
router.get('/me', authMiddleware, getOwnComplaints);
router.get('/:id', authMiddleware, getComplaintDetails);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllComplaints);
router.get('/admin/:id', authMiddleware, adminMiddleware, getComplaintDetailsAdmin);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, updateComplaintStatus);

module.exports = router;
