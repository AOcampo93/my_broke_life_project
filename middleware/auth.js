// middleware/auth.js
//
// This middleware verifies that the request carries a valid JWT in the
// Authorization header. On success it attaches the authenticated user
// object to req.user and calls next(). On failure it returns a 401
// Unauthorized response. Tokens are signed using the secret defined in
// the .env file (JWT_SECRET).

const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: true, message: 'Authorization header missing' });
    }
    // Expect header in the form "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: true, message: 'Invalid Authorization header format' });
    }
    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const decoded = jwt.verify(token, secret);
    // Find the user in the database and attach to the request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    req.user = user;
    return next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
};