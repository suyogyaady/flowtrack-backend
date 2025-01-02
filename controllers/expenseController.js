const Expense = require("../models/expenseModel");

// Create a new expense
const createExpense = async (req, res) => {
  // Check the data
  console.log(req.body);

  // Destructure the data
  const {
    expenseName,
    expenseAmount,
    expenseDescription,
    expenseCategory,
    expenseDate,
  } = req.body;

  // Validate the data
  if (
    !expenseName ||
    !expenseAmount ||
    !expenseDescription ||
    !expenseCategory ||
    !expenseDate
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Create and save the new expense
    const newExpense = new Expense({
      expenseName,
      expenseAmount,
      expenseDescription,
      expenseCategory,
      expenseDate,
    });

    // Save the new expense
    await newExpense.save();

    res.status(200).json({
      success: true,
      message: "Expense created successfully",
      expense: newExpense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const allExpenses = await Expense.find({});
    res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      expenses: allExpenses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
};
