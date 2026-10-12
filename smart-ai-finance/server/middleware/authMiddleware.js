const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  try {
    const user = await User.findById(decoded.id).select('name email');
    if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { protect };
