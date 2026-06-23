const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Sử dụng JWT_SECRET từ môi trường (access-secret-key)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'access-secret-key');
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
