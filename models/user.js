// models/user.js
//
// Definition of the User model. Users may authenticate via local
// credentials (email/password) or an external provider such as Google.
// The authProvider field identifies how the account was created. The
// authId holds a provider‑specific identifier (e.g. Google sub claim).
// The role field controls what operations the user may perform.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    authProvider: {
      type: String,
      enum: ['google', 'credentials'],
      required: true,
    },
    authId: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+@.+\..+/, // basic email validation
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatarUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);