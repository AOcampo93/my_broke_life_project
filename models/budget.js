// models/budget.js
//
// Budgets define a spending limit for a given category and month. The
// month field is stored as a string in the form 'YYYY-MM' to make
// querying easier. The spent field may be updated by the application
// logic when transactions are created or updated.

const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

budgetSchema.virtual("categories", {
  ref: "Category",
  localField: "_id",
  foreignField: "budgetId",
  justOne: false,
});


// return the total sum of all the categories in the budget. This returns the overall value 'left' in the budget. 
budgetSchema.virtual('total').get(function(){
  total = this.spent
  
    if (this.categories !== undefined){
      this.categories.forEach((c) => {
        total += c.total
      })

    }

  
  return total
})
module.exports = mongoose.model('Budget', budgetSchema);