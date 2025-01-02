const Income = require("../models/incomeModel");

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

module.exports = {
  createIncome,
  getAllIncomes,
};
