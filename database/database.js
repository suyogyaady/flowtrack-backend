const mongoose = require("mongoose");

const database = () => {
  mongoose.connect(process.env.MONGODB_LOC).then(() => {
    console.log("Database Connected");
  });
};

module.exports = database;
