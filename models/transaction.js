// models/transaction.js
//
// Transactions record a single financial event (expense or income) for a
// user. A transaction references a category and includes the amount,
// date of occurrence, optional note, and account. Storing type here in
// addition to the category allows for faster querying by type.

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
    },
    account: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);