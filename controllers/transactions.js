// controllers/transactions.js
//
// Controller functions for CRUD operations on transactions. Transactions
// represent financial events (expense or income) and are tied to a
// category. Users may filter transactions by date range, type or
// category using query parameters.

const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Category = require('../models/category');

/**
 * GET /transactions
 * Return all transactions for the authenticated user. Supports
 * optional query parameters:
 *   - from: ISO date string, only return transactions on or after this date
 *   - to: ISO date string, only return transactions before this date
 *   - type: 'expense' or 'income'
 *   - category: category id
 */
async function getAll(req, res, next) {
  try {
    const { from, to, type, category } = req.query;
    const filter = { userId: req.user._id };
    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.categoryId = category;
    }
    if (from || to) {
      filter.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) {
          filter.date.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) {
          filter.date.$lte = toDate;
        }
      }
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    return res.status(200).json(transactions);
  } catch (err) {
    console.error('transactions.getAll error:', err);
    return next(err);
  }
}

/**
 * GET /transactions/:id
 * Return a single transaction belonging to the authenticated user
 */
async function getSingle(req, res, next) {
  try {
    const { id } = req.params;
    const txn = await Transaction.findOne({ _id: id, userId: req.user._id });
    if (!txn) {
      return res.status(404).json({ error: true, message: 'Transaction not found' });
    }
    return res.status(200).json(txn);
  } catch (err) {
    console.error('transactions.getSingle error:', err);
    return next(err);
  }
}

/**
 * POST /transactions
 * Create a new transaction. Required fields are categoryId, amount,
 * type and date. Optional fields: note and account. The type must
 * match the category type (e.g. you cannot record income on an
 * expense category).
 */
async function createTransaction(req, res, next) {
  try {
    const { categoryId, amount, type, date, note, account } = req.body;
    if (!categoryId || !amount || !type || !date) {
      return res.status(400).json({ error: true, message: 'categoryId, amount, type and date are required' });
    }
    // Validate category belongs to the user
    const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
    if (!category) {
      return res.status(400).json({ error: true, message: 'Invalid category' });
    }
    // Ensure transaction type matches category type
    if (category.type !== type) {
      return res.status(400).json({ error: true, message: `Transaction type must match category type (${category.type})` });
    }
    const txn = new Transaction({
      userId: req.user._id,
      categoryId,
      amount,
      type,
      date,
      note,
      account,
    });
    await txn.save();
    return res.status(201).json(txn);
  } catch (err) {
    console.error('transactions.createTransaction error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * PUT /transactions/:id
 * Update an existing transaction. Only provided fields are updated.
 * If categoryId is changed ensure the category exists and matches the
 * type, and still belongs to the user. Prevent changing userId.
 */
async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    let txn = await Transaction.findOne({ _id: id, userId: req.user._id });
    if (!txn) {
      return res.status(404).json({ error: true, message: 'Transaction not found' });
    }
    const { categoryId, amount, type, date, note, account } = req.body;
    // If categoryId or type is provided, validate
    if (categoryId || type) {
      const newCategoryId = categoryId || txn.categoryId;
      const newType = type || txn.type;
      const category = await Category.findOne({ _id: newCategoryId, userId: req.user._id });
      if (!category) {
        return res.status(400).json({ error: true, message: 'Invalid category' });
      }
      if (category.type !== newType) {
        return res.status(400).json({ error: true, message: `Transaction type must match category type (${category.type})` });
      }
      txn.categoryId = newCategoryId;
      txn.type = newType;
    }
    if (amount !== undefined) txn.amount = amount;
    if (date !== undefined) txn.date = date;
    if (note !== undefined) txn.note = note;
    if (account !== undefined) txn.account = account;
    await txn.save();
    return res.status(200).json(txn);
  } catch (err) {
    console.error('transactions.updateTransaction error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: true, message: err.message });
    }
    return next(err);
  }
}

/**
 * DELETE /transactions/:id
 * Remove a transaction belonging to the authenticated user
 */
async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const txn = await Transaction.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!txn) {
      return res.status(404).json({ error: true, message: 'Transaction not found' });
    }
    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('transactions.deleteTransaction error:', err);
    return next(err);
  }
}

module.exports = {
  getAll,
  getSingle,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};