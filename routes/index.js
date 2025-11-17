// routes/index.js
//
// Central route registry. This file composes all of the sub‑routers
// together and defines a simple health check at the root. The
// server.js file mounts this router under the /api prefix so that
// endpoints are namespaced accordingly (e.g. /api/categories).

const express = require('express');
const router = express.Router();

// Basic health check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'MyBrokeLife API' });
});

// Authentication routes
router.use('/auth', require('./auth'));

// Protected resource routes
router.use('/categories', require('./categories'));
router.use('/transactions', require('./transactions'));
router.use('/budgets', require('./budgets'));
router.use('/reports', require('./reports'));

// Swagger documentation route (serves /api-docs)
router.use('/', require('./swagger'));

// Fallback 404 handler for unknown routes
router.use((req, res) => {
  res.status(404).json({ error: true, message: 'Not Found' });
});

module.exports = router;