const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const internalTokenHeader = req.headers['x-internal-service'];

  // INTERNAL BYPASS: Allow communication between microservices
  const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || 'your-internal-secret-token';
  if (internalTokenHeader && token === INTERNAL_TOKEN) {
    req.user = { id: 'system', role: 'ADMIN' };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'access-secret-key');
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
