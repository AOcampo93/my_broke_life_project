// routes/budgets.js
//
// Routes for managing budgets. All budget operations require
// authentication. Budgets help users stay within spending limits.

const router = require('express').Router();
const budgetsController = require('../controllers/budgets');
const authenticate = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

// Require authentication for all budget routes
router.use(authenticate);

// GET /budgets - list all budgets for user
router.get('/', budgetsController.getAll);

// GET /budgets/:id - get a single budget
router.get('/:id', validateObjectId, budgetsController.getSingle);

// POST /budgets - create or update a budget for (category, month)
router.post('/', budgetsController.createBudget);

// PUT /budgets/:id - update a budget
router.put('/:id', validateObjectId, budgetsController.updateBudget);

// DELETE /budgets/:id - delete a budget
router.delete('/:id', validateObjectId, budgetsController.deleteBudget);

module.exports = router;