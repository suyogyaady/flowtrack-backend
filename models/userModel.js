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

  // resetPasswordOTP: {
  //   type: Number,
  //   default: null,
  // },

  // resetPasswordExpires: {
  //   type: Date,
  //   default: null,
  // },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
