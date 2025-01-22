const Expense = require("../models/expenseModel");
const Transaction = require("../models/transcationModel");

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

//delete expense
const deleteExpense = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    console.log(transaction.ExpenseID);

    const expenseId = transaction.ExpenseID;
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    // delete the transcation of the expense
    await Transaction.deleteMany({ ExpenseID: expenseId });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  deleteExpense,
};
