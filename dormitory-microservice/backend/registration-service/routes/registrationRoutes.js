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

// ⚠️ IMPORTANT: Admin/static routes MUST be declared BEFORE /:id wildcard routes
// Otherwise Express will try to match "admin", "me" as IDs

// Admin routes (declared first to avoid conflict with /:id)
router.get('/admin/list', authMiddleware, adminMiddleware, getAllRegistrations);
router.get('/admin/:id', authMiddleware, adminMiddleware, getRegistrationDetailsAdmin);
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, approveRegistration);
router.patch('/admin/:id/reject', authMiddleware, adminMiddleware, rejectRegistration);

// Student routes
router.post('/', authMiddleware, createRegistration);
router.get('/me', authMiddleware, getOwnRegistrations);
router.patch('/:id/cancel', authMiddleware, cancelRegistration);
router.get('/:id', authMiddleware, getRegistrationDetails);

module.exports = router;
