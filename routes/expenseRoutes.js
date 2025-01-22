const router = require("express").Router();
const { authGuard } = require("../middleware/authGuard");

const expenseController = require("../controllers/expenseController");

//EXPENSE
router.post("/create_expense", expenseController.createExpense);
// Route to fetch all expenses
router.get("/get_all_expenses", expenseController.getAllExpenses);

// deleteExpense
router.delete(
  "/delete_expense/:id",
  authGuard,
  expenseController.deleteExpense
);

// exporting the router
// export default router;
module.exports = router;
