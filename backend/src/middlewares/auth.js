const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Bearer token and loads the user onto req.user.
const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }
    req.user = user;
    return next();
  } catch {
    res.status(401);
    return next(new Error('Not authorized, token failed'));
  }
};

// Must run after protect. Blocks every non-admin account.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  return next(new Error('Admin access required'));
};

module.exports = { protect, adminOnly };
