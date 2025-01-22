const Income = require("../models/incomeModel");
const Transaction = require("../models/transcationModel");

// Create a new income
const createIncome = async (req, res) => {
  // Display the incoming data
  console.log(req.body);

  // Destructure the data
  const {
    incomeName,
    incomeAmount,
    incomeCategory,
    incomeDate,
    incomeDescription,
  } = req.body;

  // validate the data
  if (
    !incomeName ||
    !incomeAmount ||
    !incomeCategory ||
    !incomeDate ||
    !incomeDescription
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const {
      incomeName,
      incomeAmount,
      incomeCategory,
      incomeDate,
      incomeDescription,
    } = req.body;

    // Validate input
    if (
      !incomeName ||
      !incomeAmount ||
      !incomeCategory ||
      !incomeDate ||
      !incomeDescription
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create and save the new income
    const newIncome = new Income({
      incomeName,
      incomeAmount,
      incomeCategory,
      incomeDate,
      incomeDescription,
    });

    const savedIncome = await newIncome.save();

    res.status(201).json({
      success: true,
      message: "Income added successfully",
      data: savedIncome,
    });
  } catch (error) {
    console.error("Error creating income:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all incomes
const getAllIncomes = async (req, res) => {
  try {
    const allIncomes = await Income.find({});
    res.status(200).json({
      success: true,
      message: "Incomes fetched successfully",
      incomes: allIncomes,
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

// delete income
const deleteIncome = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const incomeId = transaction.IncomeID;
    const deletedIncome = await Income.findByIdAndDelete(incomeId);
    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    // delete the transcation of the income
    await Transaction.deleteMany({ IncomeID: incomeId });

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createIncome,
  getAllIncomes,
  deleteIncome,
};
