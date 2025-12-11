// models/category.js
//
// Categories allow users to group transactions into logical buckets such as
// "Food", "Rent", or "Salary". Each category belongs to a single user
// and may be used for expenses or income. Optional color and icon
// fields make it easier for a frontend to display categories
// consistently.

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create a virtual property of the category model called "transactions".
// when called with populate in the controller, this returns the actual objects of the transactions. 
categorySchema.virtual("transactions", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "categoryId",
  justOne: false,
});


// return the total of all transactions in this category. 
categorySchema.virtual("total").get(function () {
  total = 0;
  if (this.transactions !== undefined) {
    this.transactions.forEach((transaction) => {
      if (transaction.type == "expense") {
        total -= transaction.amount;
      } else {
        total += transaction.amount;
      }
    });
  }

  return total;
});

module.exports = mongoose.model('Category', categorySchema);
