const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  me,
  verifyToken,
  refreshToken,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, me);
router.post('/verify', authenticateToken, verifyToken);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
