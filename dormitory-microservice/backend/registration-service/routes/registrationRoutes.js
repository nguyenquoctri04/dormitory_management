const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createRegistration,
  getOwnRegistrations,
  getRegistrationDetails,
  cancelRegistration,
  getAllRegistrations,
  getRegistrationDetailsAdmin,
  approveRegistration,
  rejectRegistration,
} = require('../controllers/registrationController');

const router = express.Router();

// Student routes
router.post('/', authMiddleware, createRegistration);
router.get('/me', authMiddleware, getOwnRegistrations);
router.get('/:id', authMiddleware, getRegistrationDetails);
router.patch('/:id/cancel', authMiddleware, cancelRegistration);

// Admin routes
router.get('/admin/list', authMiddleware, adminMiddleware, getAllRegistrations);
router.get('/admin/:id', authMiddleware, adminMiddleware, getRegistrationDetailsAdmin);
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, approveRegistration);
router.patch('/admin/:id/reject', authMiddleware, adminMiddleware, rejectRegistration);

module.exports = router;
