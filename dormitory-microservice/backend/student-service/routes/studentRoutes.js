const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createStudentProfile,
  getOwnProfile,
  updateOwnProfile,
  getAllStudents,
  getStudentDetails,
} = require('../controllers/studentController');

const router = express.Router();

// Student routes
router.post('/', authMiddleware, createStudentProfile);
router.get('/me', authMiddleware, getOwnProfile);
router.patch('/me', authMiddleware, updateOwnProfile);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllStudents);
router.get('/admin/:id', authMiddleware, adminMiddleware, getStudentDetails);

module.exports = router;
