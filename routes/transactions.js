// routes/transactions.js
//
// Routes for managing transactions. All transaction routes require
// authentication. Filtering by query parameters is supported on the
// index route.

const router = require('express').Router();
const transactionsController = require('../controllers/transactions');
const authenticate = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

// Require a valid token for all transaction routes
router.use(authenticate);

// GET /transactions - list transactions with optional filters
router.get('/', transactionsController.getAll);

// GET /transactions/:id - get a single transaction
router.get('/:id', validateObjectId, transactionsController.getSingle);

// POST /transactions - create a new transaction
router.post('/', transactionsController.createTransaction);

// PUT /transactions/:id - update a transaction
router.put('/:id', validateObjectId, transactionsController.updateTransaction);

// DELETE /transactions/:id - delete a transaction
router.delete('/:id', validateObjectId, transactionsController.deleteTransaction);

module.exports = router;