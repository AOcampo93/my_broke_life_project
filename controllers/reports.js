// controllers/reports.js
//
// Reporting endpoints allow users to view summaries of their
// transactions. The monthly summary aggregates transactions by
// category and separates totals for income and expenses.

const mongoose = require('mongoose');
const Transaction = require('../models/transaction');

/**
 * GET /reports/monthly
 * Return a summary of spending and income for a given month. The
 * month query parameter should be in 'YYYY-MM' format. If omitted,
 * the current month is used. The response includes total income,
 * total expenses and a breakdown by category.
 */
async function getMonthlySummary(req, res, next) {
  try {
    let { month } = req.query;
    const now = new Date();
    if (!month) {
      // Default to current month
      const m = String(now.getMonth() + 1).padStart(2, '0');
      month = `${now.getFullYear()}-${m}`;
    }
    // Parse year and month
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1; // JS months are 0-based
    if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return res.status(400).json({ error: true, message: 'Invalid month format. Use YYYY-MM.' });
    }
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 1);
    // Aggregate transactions in the month
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        // Join category to get name and type
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          category: { $first: '$category.name' },
          type: { $first: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);
    // Compute overall totals
    let totalIncome = 0;
    let totalExpenses = 0;
    const categories = summary.map((item) => {
      if (item.type === 'income') totalIncome += item.total;
      if (item.type === 'expense') totalExpenses += item.total;
      return { category: item.category, type: item.type, total: item.total };
    });
    const report = {
      month,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      categories,
    };
    return res.status(200).json(report);
  } catch (err) {
    console.error('reports.getMonthlySummary error:', err);
    return next(err);
  }
}

module.exports = {
  getMonthlySummary,
};