// db/connect.js
//
// This module exposes two functions to work with MongoDB via Mongoose:
//  - initDb(callback): establish a single connection and invoke the callback
//    once connected or on error. The connection options are read from
//    environment variables. See .env.example for details.
//  - getDb(): return the existing connection after initialization.
//
// By keeping the connection logic in one place it becomes easier to
// configure MongoDB in development and production without scattering
// credentials throughout the codebase.

const mongoose = require('mongoose');
require('dotenv').config();

let connection = null;

/**
 * Initialize the MongoDB connection using Mongoose. This helper ensures
 * that only one connection is created during the lifetime of the
 * application. It accepts a callback which will be invoked when
 * connection succeeds or fails.
 *
 * @param {Function} callback - function to call once connection is established or on error
 */
const initDb = async (callback) => {
  if (connection) {
    console.log('Database is already initialized');
    return callback(null, connection);
  }
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment');
    }
    connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return callback(null, connection);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    return callback(err);
  }
};

/**
 * Return the active MongoDB connection. If initDb has not been called
 * previously this function will throw to remind callers to initialize
 * the database before usage.
 *
 * @returns {mongoose.Connection}
 */
const getDb = () => {
  if (!connection) {
    throw new Error('Database has not been initialized. Call initDb first.');
  }
  return connection;
};

module.exports = {
  initDb,
  getDb,
};