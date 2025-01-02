const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    incomeName: {
      type: String,
      required: [true, "Income name is required"],
      trim: true,
      maxlength: [100, "Income name cannot exceed 100 characters"],
    },
    incomeAmount: {
      type: Number,
      required: [true, "Income amount is required"],
      min: [0, "Income amount must be a positive number"],
    },
    incomeCategory: {
      type: String,
      required: [true, "Income category is required"],
      enum: {
        values: [
          "Salary",
          "Interest Received",
          "Dividend",
          "Bonus",
          "Overtime",
          "Rental Income",
          "Other",
        ],
        message: "Invalid category",
      },
    },
    incomeDate: {
      type: Date,
      required: [true, "Income date is required"],
      default: Date.now,
    },
    incomeDescription: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model("Income", incomeSchema);
module.exports = Income;
