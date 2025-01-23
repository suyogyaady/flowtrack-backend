const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    default: 0, // Initial budget is 0, can be updated when the user is created
    min: [0, "Budget cannot be negative"], // Prevent negative budgets
  },
  profilePicture: {
    type: String,
  },

  isGoogle: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: Number,
    default: null,
  },

  otpExpiration: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
