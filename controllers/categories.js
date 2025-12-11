// controllers/categories.js
//
// Controller functions for category CRUD operations. Categories belong
// to individual users and are used to group transactions. All
// operations are secured so that users can only manipulate their own
// categories.

const Category = require('../models/category');

/**
 * GET /categories
 * Return all categories for the authenticated user
 */
async function getAll(req, res, next) {
  try {
    const categories = await Category.find({ userId: req.user._id });
    return res.status(200).json(categories);
  } catch (err) {
    console.error('categories.getAll error:', err);
    return next(err);
  }
}

/**
 * GET /categories/:id
 * Return a single category by ID for the authenticated user
 */
async function getSingle(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id, userId: req.user._id }).populate("transactions");
    if (!category) {
      return res.status(404).json({ error: true, message: 'Category not found' });
    }
    return res.status(200).json(category);
  } catch (err) {
    console.error('categories.getSingle error:', err);
    return next(err);
  }
}

/**
 * POST /categories
 * Create a new category. Name and type are required. Optionally
 * accepts color and icon fields.
 */
async function createCategory(req, res, next) {
  try {
    const { name, type, color, icon, budgetId } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: true, message: 'name and type are required' });
    }
    const category = new Category({
      userId: req.user._id,
      name,
      type,
      budgetId,
      icon,
    });
    await category.save();
    return res.status(201).json(category);
  } catch (err) {
    console.error('categories.createCategory error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * PUT /categories/:id
 * Update an existing category. Only provided fields will be updated.
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    // Only allow updates of user owned categories
    const category = await Category.findOne({ _id: id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ error: true, message: 'Category not found' });
    }
    const { name, type, color, icon } = req.body;
    if (name !== undefined) category.name = name;
    if (type !== undefined) category.type = type;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    await category.save();
    return res.status(200).json(category);
  } catch (err) {
    console.error('categories.updateCategory error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * DELETE /categories/:id
 * Delete a category. Note: you might want to ensure no transactions
 * reference the category before deleting. That logic is left to the
 * client.
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ error: true, message: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('categories.deleteCategory error:', err);
    return next(err);
  }
}

module.exports = {
  getAll,
  getSingle,
  createCategory,
  updateCategory,
  deleteCategory,
};