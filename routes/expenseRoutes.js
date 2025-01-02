const router = require("express").Router();
// const { authGuard, adminGuard } = require("../middleware/authGuard");

const expenseController = require("../controllers/expenseController");

//EXPENSE
router.post("/create_expense", expenseController.createExpense);
// Route to fetch all expenses
router.get("/get_all_expenses", expenseController.getAllExpenses);

// exporting the router
// export default router;
module.exports = router;
