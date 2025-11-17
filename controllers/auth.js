// controllers/auth.js
//
// Controller functions for user authentication and registration. Users
// may register with email/password or sign in via Google OAuth. Upon
// successful authentication a JWT is generated and returned along with
// minimal user information. Passwords are hashed using bcrypt.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');

// Initialize Google OAuth client with the configured client ID. If no
// client ID is defined the client will still be created but
// verification will always fail. See .env.example for details.
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
const googleClient = new OAuth2Client(googleClientId);

/**
 * Helper to generate a JWT for an authenticated user. The token
 * contains the user id and role and expires according to the
 * JWT_EXPIRES_IN environment variable (default 7 days).
 *
 * @param {Object} user Mongoose user document
 * @returns {String} signed JWT
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'please-change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
}

/**
 * Register a new user with local credentials. Required fields are
 * email, password and name. The password is hashed before storing.
 */
async function register(req, res, next) {
  try {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: true, message: 'email, password and name are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      authProvider: 'credentials',
      email,
      password: hashed,
      name,
      phone,
      role: role || 'user',
    });
    await user.save();
    const token = generateToken(user);
    const userInfo = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.status(201).json({ token, user: userInfo });
  } catch (err) {
    console.error('auth.register error:', err);
    if (err?.code === 11000) {
      return res.status(409).json({ error: true, message: 'Email already in use' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * Authenticate a user with local credentials. Expects email and
 * password. Returns a JWT and minimal user info on success.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'email and password are required' });
    }
    const user = await User.findOne({ email, authProvider: 'credentials' });
    if (!user || !user.password) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    const userInfo = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.status(200).json({ token, user: userInfo });
  } catch (err) {
    console.error('auth.login error:', err);
    return next(err);
  }
}

/**
 * Authenticate a user via Google OAuth. Expects a Google idToken in
 * the request body. The id token is verified against the configured
 * Google client ID. On success a new user is created if one does not
 * already exist. Returns a JWT and minimal user info.
 */
async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: true, message: 'idToken is required' });
    }
    const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    const authId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Google User';
    const picture = payload.picture;
    let user = await User.findOne({ authProvider: 'google', authId });
    if (!user) {
      user = new User({
        authProvider: 'google',
        authId,
        email,
        name,
        avatarUrl: picture,
        role: 'user',
      });
      await user.save();
    }
    const token = generateToken(user);
    const userInfo = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.status(200).json({ token, user: userInfo });
  } catch (err) {
    console.error('auth.google error:', err);
    return res.status(401).json({ error: true, message: 'Invalid Google id token' });
  }
}

/**
 * Logout endpoint. Since JWTs are stateless we cannot truly invalidate
 * a token on the server. The client should remove its copy. This
 * endpoint simply returns a success message.
 */
async function logout(req, res) {
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  register,
  login,
  googleAuth,
  logout,
};