const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createUtility,
  getOwnUtilities,
  getUtilityDetails,
  getAllUtilities,
  getUtilityDetailsAdmin,
  updateUtility,
} = require('../controllers/utilityController');

const router = express.Router();

// Student routes
router.get('/me', authMiddleware, getOwnUtilities);
router.get('/:id', authMiddleware, getUtilityDetails);

// Admin routes
router.post('/admin/create', authMiddleware, adminMiddleware, createUtility);
router.get('/admin/list', authMiddleware, adminMiddleware, getAllUtilities);
router.get('/admin/:id', authMiddleware, adminMiddleware, getUtilityDetailsAdmin);
router.patch('/admin/:id', authMiddleware, adminMiddleware, updateUtility);

module.exports = router;
