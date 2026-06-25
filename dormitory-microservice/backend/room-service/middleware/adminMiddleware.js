const adminMiddleware = (req, res, next) => {
  // Allow internal service calls
  const internalToken = req.headers.authorization?.split(' ')[1];
  if (internalToken === (process.env.INTERNAL_TOKEN || 'your-internal-secret-token')) {
    return next();
  }

  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'STAFF') {
    return res.status(403).json({ error: 'Access denied. Admin or Staff only.' });
  }
  next();
};


module.exports = adminMiddleware;
