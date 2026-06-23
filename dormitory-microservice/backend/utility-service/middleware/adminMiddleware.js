const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'STAFF') {
    return res.status(403).json({ error: 'Access denied. Admin or Staff only.' });
  }
  next();
};

module.exports = adminMiddleware;
