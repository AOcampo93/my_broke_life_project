// models/category.js
//
// Categories allow users to group transactions into logical buckets such as
// "Food", "Rent", or "Salary". Each category belongs to a single user
// and may be used for expenses or income. Optional color and icon
// fields make it easier for a frontend to display categories
// consistently.

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    color: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);