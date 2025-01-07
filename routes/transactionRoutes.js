const router = require("express").Router();
const { authGuard, adminGuard } = require("../middleware/authGuard");

const transcationController = require("../controllers/transactionController");

// Add
router.post(
  "/create_transaction",
  authGuard,
  transcationController.createTransaction
);

// Route to fetch all expenses
router.get(
  "/get_all_transactions",
  authGuard,
  transcationController.getTransactions
);

// Route to fetch all expenses
router.get(
  "/get_all_transactions_by_user",
  authGuard,
  transcationController.getTransactionsByUser
);

// Get total expense
router.get(
  "/get_total_expense",
  authGuard,
  transcationController.getTotalExpenses
);

// Get total income
router.get(
  "/get_total_income",
  authGuard,
  transcationController.getTotalIncomes
);

// Get expense by user
router.get(
  "/get_all_expense",
  authGuard,
  transcationController.getExpensesByUser
);
// Get income by user
router.get(
  "/get_all_income",
  authGuard,
  transcationController.getIncomesByUser
);

// exporting the router
// export default router;
module.exports = router;
