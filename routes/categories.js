// routes/categories.js
//
// Routes for managing categories. All category routes require
// authentication. See controllers/categories.js for implementation.

const router = require('express').Router();
const categoriesController = require('../controllers/categories');
const authenticate = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

// Apply authentication to all category routes
router.use(authenticate);

// GET /categories - list all categories for the user
router.get('/', categoriesController.getAll);

// GET /categories/:id - get a single category
router.get('/:id', validateObjectId, categoriesController.getSingle);

// POST /categories - create a new category
router.post('/', categoriesController.createCategory);

// PUT /categories/:id - update a category
router.put('/:id', validateObjectId, categoriesController.updateCategory);

// DELETE /categories/:id - delete a category
router.delete('/:id', validateObjectId, categoriesController.deleteCategory);

module.exports = router;