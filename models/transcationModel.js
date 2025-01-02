const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    required: true,
    enum: ["Expense", "Income"], // Limit to specific values
  },
  ExpenseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: function () {
      return this.transactionType === "Expense";
    },
  },
  IncomeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Income",
    required: function () {
      return this.transactionType === "Income";
    },
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now, // Default to current date
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
