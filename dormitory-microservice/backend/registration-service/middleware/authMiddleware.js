const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Allow internal service-to-service calls using INTERNAL_TOKEN
  const internalToken = process.env.INTERNAL_TOKEN || 'internal-secret';
  if (token === internalToken) {
    req.user = { id: 'internal', role: 'ADMIN', isInternal: true };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'access-secret-key');
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
