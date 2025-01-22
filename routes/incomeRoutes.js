// module.exports = router
const router = require("express").Router();
const incomeController = require("../controllers/incomeController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

//EXPENSE
router.post("/create_income", incomeController.createIncome);
// Route to fetch all incomes
router.get("/get_all_incomes", incomeController.getAllIncomes);

// deleteIncome;
router.delete("/delete_income/:id", authGuard, incomeController.deleteIncome);

// exporting the router
module.exports = router;
