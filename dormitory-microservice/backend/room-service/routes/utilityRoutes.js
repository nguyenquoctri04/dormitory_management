const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createUtility,
  listUtilities,
  getUtilityDetails,
  updateUtility,
} = require('../controllers/utilityController');

const router = express.Router();

// Admin routes
router.post('/admin/create', authMiddleware, adminMiddleware, createUtility);
router.get('/admin/list', authMiddleware, adminMiddleware, listUtilities);
router.get('/admin/:id', authMiddleware, adminMiddleware, getUtilityDetails);
router.patch('/admin/:id', authMiddleware, adminMiddleware, updateUtility);

module.exports = router;
