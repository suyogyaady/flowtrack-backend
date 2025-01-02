const userModel = require("../models/userModel");
const transactionModel = require("../models/transcationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

// const sendOtp = require("../service/sendotp");

const { OAuth2Client } = require("google-auth-library");
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

// const forgotPassword = async (req, res) => {
//   console.log(req.body);

//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter your phone number",
//     });
//   }
//   try {
//     const user = await userModel.findOne({ phoneNumber: phoneNumber });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     // Generate OTP
//     const randomOTP = Math.floor(100000 + Math.random() * 900000);
//     console.log(randomOTP);

//     user.resetPasswordOTP = randomOTP;
//     user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
//     await user.save();

//     // Send OTP to user phone number
//     const isSent = await sendOtp(phoneNumber, randomOTP);

//     if (!isSent) {
//       return res.status(400).json({
//         success: false,
//         message: "Error in sending OTP",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "OTP sent to your phone number",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

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

// Update User
const updateUser = async (req, res) => {
  const id = req.user.id;
  const { password, ...restBody } = req.body; // Destructure password from req.body

  try {
    // Hash the password if present in the request body
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      restBody.password = hashedPassword;
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.username = restBody.username;
    user.title = restBody.title;
    user.email = restBody.email;

    const updatedUser = await user.save();

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating User:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update",
      error: err.message,
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  // const id = req.user.id;
  console.log(req.files);
  const { profilePicture } = req.files;

  if (!profilePicture) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  //  Upload the image
  // 1. Generate new image name
  const imageName = `${Date.now()}-${profilePicture.name}`;

  // 2. Make a upload path (/path/upload - directory)
  const imageUploadPath = path.join(
    __dirname,
    `../public/profile_pictures/${imageName}`
  );

  // Ensure the directory exists
  const directoryPath = path.dirname(imageUploadPath);
  fs.mkdirSync(directoryPath, { recursive: true });

  try {
    // 3. Move the image to the upload path
    profilePicture.mv(imageUploadPath);

    //  send image name to the user
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      profilePicture: imageName,
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

// edit user profile
// const editUserProfile = async (req, res) => {
//   const { username, email, title, profilePicture } = req.body;
//   const userId = req.user.id;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.username = username || user.username;
//     user.email = email || user.email;
//     user.title = title || user.title;
//     user.profilePicture = profilePicture || user.profilePicture;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "User profile updated successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating user profile",
//       error: error.message,
//     });
//   }
// };

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
  // try catch
  try {
    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, given_name } = ticket.getPayload();
    let user = await userModel.findOne({ email: email });
    if (!user) {
      const { password } = req.body;
      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);
      user = new userModel({
        username: given_name,
        email: email,
        password: hashedPassword,
        title: "",
      });
      await user.save();
    }
    // generate token
    const jwtToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      (options = {
        expiresIn: Date.now() + 20 * 24 * 60 * 60 * 1000 || "1d",
      })
    );
    return res.status(200).json({
      success: true,
      message: "User Logged In Successfully!",
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
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
      success: false,
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
  updateUser,
  getToken,
  googleLogin,
  getUserByGoogleEmail,
  editUserProfile,
  uploadProfilePicture,
};
