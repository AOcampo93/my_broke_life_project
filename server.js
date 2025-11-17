// server.js
//
// Entry point of the MyBrokeLife API. This file configures
// Express, connects to MongoDB, mounts all API routes, and starts
// listening on the configured port. Environmental variables for the
// database connection and JWT secrets are loaded from a .env file when
// available.

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const db = require('./db/connect');
const routes = require('./routes');
const errorHandler = require('./middleware/error');

// Load environment variables from .env if present
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// When behind a proxy (e.g. Render) trust the X‑Forwarded headers so
// req.protocol returns the correct scheme (http vs https)
app.enable('trust proxy');

/*
 * Global middleware
 */
// Log requests to the console
app.use(morgan('dev'));
// Parse JSON bodies
app.use(express.json());
// Configure CORS. You can restrict origins via CORS_ORIGIN env var
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Preflight responses for all routes
app.options('*', cors());

/*
 * API routes
 * All endpoints are prefixed with /api for clarity. See routes/index.js
 * for route definitions.
 */
app.use('/api', routes);

// Global error handler. Should come after all routes
app.use(errorHandler);

/*
 * Connect to MongoDB then start the server. If the connection fails
 * the application will exit and log the error.
 */
db.initDb((err) => {
  if (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`MyBrokeLife API is listening on port ${port}`);
  });
});