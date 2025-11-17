// routes/reports.js
//
// Reporting routes. Currently only a monthly summary is available.
// Reports are read‑only and require authentication.

const router = require('express').Router();
const reportsController = require('../controllers/reports');
const authenticate = require('../middleware/auth');

// All report routes require authentication
router.use(authenticate);

// GET /reports/monthly?month=YYYY-MM - return monthly summary
router.get('/monthly', reportsController.getMonthlySummary);

module.exports = router;