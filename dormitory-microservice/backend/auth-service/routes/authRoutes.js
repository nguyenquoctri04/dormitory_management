const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  me,
  verifyToken,
  refreshToken,
  createInitialAdmin,
  getAllUsers,
  createStaff,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  changePassword,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/setup-admin', createInitialAdmin);

// Protected routes
router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);
router.post('/verify', authenticateToken, verifyToken);
router.patch('/change-password', authenticateToken, changePassword);

// Admin only routes
router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.post('/admin/staff', authenticateToken, isAdmin, createStaff);
router.patch('/users/:id/status', authenticateToken, isAdmin, updateUserStatus);
router.patch('/users/:id/role', authenticateToken, isAdmin, updateUserRole);
router.delete('/users/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;
