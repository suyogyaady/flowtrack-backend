const Transaction = require("../models/transcationModel");
const { adjustBudget } = require("./userController");

const Expense = require("../models/expenseModel");
const Income = require("../models/incomeModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

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
    let amount = 0;

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
      amount,
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
      .populate("IncomeID", "incomeName incomeAmount incomeCategory")
      .populate("userID", "name email")
      .sort({ transactionDate: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalExpenses = async (req, res) => {
  try {
    const userID = req.user.id;

    // Fetch all transactions of type "Expense" for the user
    const expenses = await Transaction.find({
      userID,
      transactionType: "Expense",
    });

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );

    res.status(200).json({
      totalExpenses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalIncomes = async (req, res) => {
  try {
    const userID = req.user.id;

    // Fetch all transactions of type "Income" for the user
    const incomes = await Transaction.find({
      userID,
      transactionType: "Income",
    });

    // Calculate total incomes
    const totalIncomes = incomes.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );

    res.status(200).json({
      totalIncomes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get expenses by user
exports.getExpensesByUser = async (req, res) => {
  try {
    const userID = req.user.id;
    const transactions = await Transaction.find({
      userID,
      transactionType: "Expense",
    })
      .populate("ExpenseID", "expenseName expenseAmount expenseCategory")
      .populate("userID")
      .sort({ transactionDate: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get incomes by user
exports.getIncomesByUser = async (req, res) => {
  try {
    const userID = req.user.id;

    const transactions = await Transaction.find({
      userID,
      transactionType: "Income",
    })
      .populate("IncomeID")
      .populate("userID")
      .sort({ transactionDate: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get income and expenses by month
exports.getTransactionsByMonth = async (req, res) => {
  try {
    const userID = req.user.id;
    const year = parseInt(req.query.year || "2025");

    if (!year || isNaN(year)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing year parameter" });
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userID: new mongoose.Types.ObjectId(userID),
          transactionDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          month: { $month: "$transactionDate" },
        },
      },
      {
        $group: {
          _id: { month: "$month", transactionType: "$transactionType" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          transactions: {
            $push: {
              transactionType: "$_id.transactionType",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create an array with all months
    const allMonths = Array.from({ length: 12 }, (_, index) => {
      // Find existing data for this month
      const monthData = transactions.find((t) => t._id === index + 1);

      return {
        month: index + 1,
        income:
          monthData?.transactions.find((t) => t.transactionType === "Income")
            ?.totalAmount || 0,
        expense:
          monthData?.transactions.find((t) => t.transactionType === "Expense")
            ?.totalAmount || 0,
      };
    });

    res.status(200).json(allMonths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
};

// Get monthly transactions with budget
exports.getMonthlyTransactionsWithBudget = async (req, res) => {
  try {
    const userID = req.user.id;
    const year = parseInt(req.query.year || new Date().getFullYear());

    if (!year || isNaN(year)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing year parameter" });
    }

    // Get user's budget
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const budget = user.budget || 0;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userID: new mongoose.Types.ObjectId(userID),
          transactionDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          month: { $month: "$transactionDate" },
        },
      },
      {
        $group: {
          _id: { month: "$month", transactionType: "$transactionType" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          transactions: {
            $push: {
              transactionType: "$_id.transactionType",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create an array with all months including income, expense, and budget
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const monthData = transactions.find((t) => t._id === monthNumber);

      const month = new Date(year, index, 1).toLocaleString("default", {
        month: "short",
      });

      const income =
        monthData?.transactions.find((t) => t.transactionType === "Income")
          ?.totalAmount || 0;
      const expense =
        monthData?.transactions.find((t) => t.transactionType === "Expense")
          ?.totalAmount || 0;

      return {
        month,
        income,
        expense,
        savings: income - expense,
        budget,
      };
    });

    res.status(200).json(monthlyData);
  } catch (error) {
    console.error("Error in getMonthlyTransactionsWithBudget:", error);
    res.status(500).json({ error: error.message });
  }
};
