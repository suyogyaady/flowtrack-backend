const userModel = require("../models/userModel");
const transactionModel = require("../models/transcationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// const sendOtp = require("../service/sendotp");

const { OAuth2Client } = require("google-auth-library");
const sendResetEmail = require("../services/sendResetEmail");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createUser = async (req, res) => {
  // 1. Check incoming data
  console.log(req.body);

  // 2. Destructure the incoming data
  const { username, title, email, password, budget } = req.body;

  // 3. Validate the data (if empty, stop the process and send response)
  if (!username || !title || !email || !password || !budget) {
    // res.send("Please enter all fields!")
    return res.json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // 4. Error Handling (Try Catch)
  try {
    // 5. Check if the user is already registered
    const existingUser = await userModel.findOne({ email: email });

    // 5.1 if user found: Send response
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists!",
      });
    }

    // Hashing/Encryption of the password
    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    // 5.2 if user is new:
    const newUser = new userModel({
      // Database Fields  : Client's Value
      username: username,
      budget: budget,

      email: email,
      title: title,
      password: hashedPassword,
    });

    console.log(newUser);

    // Save to database
    await newUser.save();

    // send the response
    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// Login Function
const loginUser = async (req, res) => {
  // Check incoming data
  console.log(req.body);

  // Destructuring
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  // Try Catch
  try {
    // Find user (email)
    const user = await userModel.findOne({ email: email });

    // notFound (error message)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist!",
      });
    }

    // Compare password (bcrypt)
    const isValidPassword = await bcrypt.compare(password, user.password);

    // If not valid (error)
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not matched!",
      });
    }

    // Token (generate - user data + KEY)
    const token = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    // Response (token, user data)
    res.status(201).json({
      success: true,
      message: "User Logged in Successfully",
      token: token,
      userData: {
        id: user._id,
        username: user.username,
        email: user.email,
        title: user.title,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    // Get the user ID from the request (assuming token verification middleware sets `req.user.id`)
    const userId = req.user.id;

    // Find the user in the database
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user account
    await userModel.findByIdAndDelete(userId);

    // Optional: If there are related records (e.g., transactions), delete them as well
    await transactionModel.deleteMany({ userId: userId });

    // Send response
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userModel.find({});
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      users: allUsers,
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

// Fetch single user profile
const getSingleProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No User Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched",
      user: {
        username: user.username,
        email: user.email,
        title: user.title,
        budget: user.budget,
        password: "Please update your password",
        profilePicture: user.profilePicture,
        isGoogle: user.isGoogle,
        _id: user._id,
      },
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

const uploadProfilePicture = async (req, res) => {
  console.log("Files:", req.files);

  // Validate that the profile picture is provided
  if (!req.files || !req.files.newImage) {
    return res.status(400).json({
      success: false,
      message: "Please provide an Image!",
    });
  }

  const { newImage } = req.files;

  // Generate a unique name for the image
  const imageName = `${Date.now()}_${newImage.name}`;

  // Define the image path
  const imagePath = path.join(
    __dirname, // Ensure you're using the correct directory path
    "../public/profile_pictures/", // Get the current directory
    imageName
  );

  // Move the uploaded image to the 'public/user/' directory
  try {
    // Ensure the 'user' directory exists
    const userDirectory = path.join(
      __dirname, // Ensure you're using the correct directory path
      "../public/profile_pictures/"
    );
    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory, { recursive: true });
    }

    // Move the image file to the destination directory
    newImage.mv(imagePath, async (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }

      // Find the user by ID
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update the profile picture in the database with the new image path
      user.profilePicture = `/profile_pictures/${imageName}`;
      await user.save();

      // Respond with the success message
      res.status(200).json({
        success: true,
        message: "Profile Picture updated successfully",
        user: user,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const editUserProfile = async (req, res) => {
  const { username, title, email } = req.body;
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if there is a new profile picture
    if (req.files && req.files.profilePicture) {
      const { profilePicture } = req.files;
      const imageName = `${Date.now()}-${profilePicture.name}`;
      const imageUploadPath = path.join(
        __dirname,
        `../public/profile_pictures/${imageName}`
      );

      // Upload the new profile picture
      await profilePicture.mv(imageUploadPath);

      // Delete the old profile picture if it exists
      if (user.profilePicture) {
        const oldImagePath = path.join(
          __dirname,
          `../public/users/${user.profilePicture}`
        );
        fs.unlinkSync(oldImagePath);
      }

      // Set the new profile picture name in the user data
      user.profilePicture = imageName;
    }

    // Update the user profile fields
    user.username = username || user.username;
    user.title = title || user.title;
    user.email = email || user.email;

    // Save the updated user profile
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

// get token
const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const token = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "Token generated successfully!",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, picture } = ticket.getPayload();

    // Find or create user
    let user = await userModel.findOne({ email: email });

    if (!user) {
      // Generate a secure random password for Google users
      const randomPassword = Math.random().toString(36).slice(-12);
      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, randomSalt);
      const title = req.body.title || "Google User";
      const budget = req.body.budget || 0;

      // Create new user
      user = new userModel({
        username: given_name,
        email: email,
        password: hashedPassword,
        title: title, // Default title for Google users
        budget: budget, // Default budget
        profilePicture: picture, // Use Google profile picture if available
        isGoogle: true,
      });

      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Successfully logged in with Google!",
      token: jwtToken,
      userData: {
        id: user._id,
        username: user.username,
        email: user.email,
        title: user.title,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate with Google",
      error: error.message,
    });
  }
};
const getUserByGoogleEmail = async (req, res) => {
  console.log(req.body);
  // Destructuring the data
  const { token } = req.body;
  // Validate
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }
  try {
    // verify token
    console.log(token);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User found",
        data: user,
      });
    }
    res.status(201).json({
      success: true,
      message: "User not found",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: e,
    });
  }
};

const adjustBudget = async (userID, transactionType, amount) => {
  try {
    const user = await userModel.findById(userID);
    if (!user) {
      throw new Error("User not found");
    }

    if (transactionType === "Income") {
      user.budget += amount; // Increase budget for income
    } else if (transactionType === "Expense") {
      if (user.budget < amount) {
        throw new Error("Insufficient budget");
      }
      user.budget -= amount; // Decrease budget for expense
    } else {
      throw new Error("Invalid transaction type");
    }

    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // 1. Check if the currentPassword and newPassword are provided
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide both current password and new password!",
    });
  }

  try {
    // 2. Find the user from the database
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // 3. Compare the current password with the one in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect!",
      });
    }

    // 4. Check if the new password is the same as the current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password!",
      });
    }

    // 5. Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 6. Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    // 7. Send response
    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateGoogleUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update required fields for first-time Google login
    if (req.body.title) {
      user.title = req.body.title;
    }
    if (req.body.monthlyBudget) {
      user.monthlyBudget = req.body.monthlyBudget;
    }
    if (req.body.googleId) {
      user.googleId = req.body.googleId;
    }

    await user.save();

    // Return updated user data
    const userData = {
      _id: user._id,
      username: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      title: user.title,
      budget: user.budget,
      profilePicture: user.profilePicture,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      userData,
    });
  } catch (error) {
    console.error("Update Google user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// send reset email
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;

    // send email
    const sent = sendResetEmail(email, otp);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    user.otpExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save the user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check otp
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // check otp expiration
    if (Date.now() > user.otpExpiration) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// get expense and income by user

// Exporting
module.exports = {
  createUser,
  loginUser,
  adjustBudget,
  // forgotPassword,
  // resetPassword,
  getAllUsers,
  getSingleProfile,
  deleteAccount,
  getToken,
  googleLogin,
  getUserByGoogleEmail,
  editUserProfile,
  uploadProfilePicture,
  changePassword,
  updateGoogleUser,
  sendPasswordResetEmail,
  resetPassword,
};
