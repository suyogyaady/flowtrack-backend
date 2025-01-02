const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      required: [true, "Expense name is required"],
      trim: true,
      maxlength: [100, "Expense name cannot exceed 100 characters"],
    },
    expenseAmount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Expense amount must be a positive number"],
    },
    expenseCategory: {
      type: String,
      required: [true, "Expense category is required"],
      enum: {
        values: [
          "Food",
          "Transportation",
          "Utilities",
          "Entertainment",
          "Healthcare",
          "Other",
        ],
        message: "Invalid category",
      },
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    expenseDescription: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
