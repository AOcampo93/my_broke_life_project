// controllers/budgets.js
//
// Budgets allow users to set monthly spending limits on categories. These
// controllers implement CRUD operations for budgets. A budget belongs
// to a user and category and is keyed by month (YYYY-MM).

const Budget = require('../models/budget');
const Category = require('../models/category');

/**
 * GET /budgets
 * Return all budgets for the authenticated user
 */
async function getAll(req, res, next) {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    return res.status(200).json(budgets);
  } catch (err) {
    console.error('budgets.getAll error:', err);
    return next(err);
  }
}

/**
 * GET /budgets/:id
 * Return a single budget by ID for the authenticated user
 */
async function getSingle(req, res, next) {
  try {
    const { id } = req.params;
    const budget = await Budget.findOne({
      _id: id,
      userId: req.user._id,
    }).populate({ path: "categories", populate: { path: "transactions" } });
    if (!budget) {
      return res.status(404).json({ error: true, message: "Budget not found" });
    }
    return res.status(200).json(budget);
  } catch (err) {
    console.error('budgets.getSingle error:', err);
    return next(err);
  }
}

/**
 * POST /budgets
 * Create a new budget. Required fields: categoryId, month, limit.
 * Validates that the category exists and belongs to the user. A budget
 * is uniquely identified by (userId, categoryId, month). If a budget
 * already exists for that key, it will be overwritten.
 */
async function createBudget(req, res, next) {
  try {
    const { startDate, limit, endDate, name } = req.body;
    if (!startDate || limit === undefined) {
      return res
        .status(400)
        .json({ error: true, message: "startDate and limit are required" });
    }

    // Upsert budget (create new or update existing)
    let budget = await Budget.findOne({
      userId: req.user._id,
      startDate,
      limit,
      endDate,
    });
    if (!budget) {
      budget = new Budget({
        userId: req.user._id,
        startDate,
        endDate,
        limit,
        name,
      });
    } else {
      budget.limit = limit;
    }
    await budget.save();
    return res.status(201).json(budget);
  } catch (err) {
    console.error('budgets.createBudget error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * PUT /budgets/:id
 * Update an existing budget. Only provided fields (month, limit,
 * categoryId) are updated. If categoryId is changed, validate
 * ownership.
 */
async function updateBudget(req, res, next) {
  try {
    const { id } = req.params;
    let budget = await Budget.findOne({ _id: id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ error: true, message: 'Budget not found' });
    }
    const { categoryId, month, limit } = req.body;
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user._id,
      });
      if (!category) {
        return res
          .status(400)
          .json({ error: true, message: 'Invalid category' });
      }
      budget.categoryId = categoryId;
    }
    if (month !== undefined) budget.month = month;
    if (limit !== undefined) budget.limit = limit;
    await budget.save();
    return res.status(200).json(budget);
  } catch (err) {
    console.error('budgets.updateBudget error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * DELETE /budgets/:id
 * Remove a budget for the authenticated user
 */
async function deleteBudget(req, res, next) {
  try {
    const { id } = req.params;
    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!budget) {
      return res.status(404).json({ error: true, message: "Budget not found" });
    }
    return res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("budgets.deleteBudget error:", err);
    return next(err);
  }
}

module.exports = {
  getAll,
  getSingle,
  createBudget,
  updateBudget,
  deleteBudget,
};
