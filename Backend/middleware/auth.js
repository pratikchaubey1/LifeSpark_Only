const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_me_change_this';

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Support both 'id' and 'userId' (Admin tokens often use userId)
    const userId = decoded.id || decoded.userId;

    // Hardcoded admin tokens might not have an ID at all, but have role: 'admin'
    if (!userId && decoded.role === 'admin') {
      req.user = { role: 'admin', _id: 'ADMIN_PROXIED' };
      return next();
    }

    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach user object to request
    req.user = user.toObject();
    next();
  } catch (err) {
    console.error('JWT verify error', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
