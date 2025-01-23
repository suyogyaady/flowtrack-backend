// module.exports = router
const router = require("express").Router();
const userController = require("../controllers/userController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating login route
router.post("/login", userController.loginUser);

//delete account route
router.delete("/delete_account", authGuard, userController.deleteAccount);

// // Creating user forgot password route
// router.post("/forgot-password", userController.forgotPassword);

// // Creating user reset password route
// router.post("/reset-password", userController.resetPassword);

router.put("/change_password", authGuard, userController.changePassword);

// Route to fetch all users
router.get("/get_all_users", authGuard, userController.getAllUsers);

// User Profile route
router.get("/get_single_profile", authGuard, userController.getSingleProfile);

// upload profile picture
router.put(
  "/upload_profile_picture",
  authGuard,
  userController.uploadProfilePicture
);

// update user details
router.put("/update_profile", authGuard, userController.editUserProfile);

//generate token
router.post("/generate_token", userController.getToken);

// login with google
router.post("/google_login", userController.googleLogin);
router.post("/get_user_by_google_email", userController.getUserByGoogleEmail);

// send password reset email
router.put("/send_password_reset_email", userController.sendPasswordResetEmail);

// reset password
router.put("/reset_password", userController.resetPassword);

// exporting the router
module.exports = router;
