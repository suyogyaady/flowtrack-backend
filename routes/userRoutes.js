// module.exports = router
const router = require("express").Router();
const userController = require("../controllers/userController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating login route
router.post("/login", userController.loginUser);

// // Creating user forgot password route
// router.post("/forgot-password", userController.forgotPassword);

// // Creating user reset password route
// router.post("/reset-password", userController.resetPassword);

// Route to fetch all users
router.get("/get_all_users", authGuard, userController.getAllUsers);

// User Profile route
router.get("/get_single_profile", authGuard, userController.getSingleProfile);
router.put("/update_profile", authGuard, userController.updateUser);

//generate token
router.post("/generate_token", userController.getToken);

// login with google
router.post("/google_login", userController.googleLogin);
router.post("/get_user_by_google_email", userController.getUserByGoogleEmail);

// exporting the router
module.exports = router;
