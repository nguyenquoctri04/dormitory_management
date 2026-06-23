const { verifyAccessToken: verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../utils/tokenBlacklist');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if (isBlacklisted(token)) {
      return res.status(403).json({ error: 'Token has been revoked' });
    }

    const decoded = verifyToken(token);
    req.user = { ...decoded, id: decoded.userId };
    req.token = token;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Require Admin role' });
  }
  next();
}

module.exports = {
  authenticateToken,
  isAdmin,
};
