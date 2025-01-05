const router = require("express").Router();
const { authGuard, adminGuard } = require("../middleware/authGuard");

const expenseController = require("../controllers/transactionController");

// Add
router.post(
  "/create_transaction",
  authGuard,
  expenseController.createTransaction
);

// Route to fetch all expenses
router.get(
  "/get_all_transactions",
  authGuard,
  expenseController.getTransactions
);

// Route to fetch all expenses
router.get(
  "/get_all_transactions_by_user",
  authGuard,
  expenseController.getTransactionsByUser
);

// Get total expense
router.get("/get_total_expense", authGuard, expenseController.getTotalExpenses);

// Get total income
router.get("/get_total_income", authGuard, expenseController.getTotalIncomes);

// exporting the router
// export default router;
module.exports = router;
