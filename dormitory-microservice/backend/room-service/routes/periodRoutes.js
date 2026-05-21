const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  listPeriods,
  getPeriodDetails,
  createPeriod,
  updatePeriod,
  deletePeriod,
} = require('../controllers/periodController');

const router = express.Router();

// Public routes
router.get('/', listPeriods);
router.get('/:id', getPeriodDetails);

// Admin routes
router.post('/admin/create', authMiddleware, adminMiddleware, createPeriod);
router.patch('/admin/:id', authMiddleware, adminMiddleware, updatePeriod);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deletePeriod);

module.exports = router;
