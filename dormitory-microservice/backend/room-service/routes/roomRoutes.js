const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  listRooms,
  getRoomDetails,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStatistics,
} = require('../controllers/roomController');

const router = express.Router();

// Public routes
router.get('/', listRooms);
router.get('/:id', getRoomDetails);

// Admin routes
router.post('/admin/create', authMiddleware, adminMiddleware, createRoom);
router.patch('/admin/:id', authMiddleware, adminMiddleware, updateRoom);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteRoom);
router.get('/admin/statistics', authMiddleware, adminMiddleware, getRoomStatistics);

module.exports = router;
