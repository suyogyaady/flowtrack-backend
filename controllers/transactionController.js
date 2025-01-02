const Transaction = require("../models/transcationModel");
const { adjustBudget } = require("./userController");

const Expense = require("../models/expenseModel");
const Income = require("../models/incomeModel");

// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const { transactionType, ExpenseID, IncomeID, transactionDate } = req.body;

    // Validate input
    if (!transactionType || !["Expense", "Income"].includes(transactionType)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing transactionType" });
    }

    const userID = req.user.id;
    amount = 0;

    if (transactionType === "Expense") {
      const expense = await Expense.findById(ExpenseID);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      amount = expense.expenseAmount;
    } else if (transactionType === "Income") {
      const income = await Income.findById(IncomeID);
      if (!income) {
        return res.status(404).json({ error: "Income not found" });
      }
      amount = income.incomeAmount;
    }

    // Adjust the user's budget
    await adjustBudget(userID, transactionType, amount);

    const transaction = new Transaction({
      transactionType,
      ExpenseID: transactionType === "Expense" ? ExpenseID : null,
      IncomeID: transactionType === "Income" ? IncomeID : null,
      transactionDate,
      userID,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("ExpenseID", "expenseName expenseAmount")
      .populate("IncomeID", "incomeName incomeAmount")
      .populate("userID", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by user
exports.getTransactionsByUser = async (req, res) => {
  try {
    const userID = req.user.id;
    const transactions = await Transaction.find({ userID })
      .populate("ExpenseID", "expenseName expenseAmount expenseCategory")
      .populate("IncomeID", "incomeName incomeAmount incomeCategory ")
      .populate("userID", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
