// routes/auth.js
//
// Authentication routes. These endpoints allow users to register,
// login with local credentials, authenticate via Google, and logout.

const router = require('express').Router();
const authController = require('../controllers/auth');

// Local registration
router.post('/register', authController.register);

// Local login
router.post('/login', authController.login);

// Google OAuth authentication
router.post('/google', authController.googleAuth);

// Logout (stateless, informs client to discard its token)
router.post('/logout', authController.logout);

module.exports = router;