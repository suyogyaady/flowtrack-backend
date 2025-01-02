const express = require("express");
const database = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const accessFormData = require("express-fileupload");
const app = express();

dotenv.config();
database();

// Enable file upload
app.use(accessFormData());

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "https://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Serve static files
app.use(express.static("./public"));

// Test API route
app.get("/FlowTrack", (req, res) => {
  res.send("Test API is Working!...");
});

// Configuring routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/expense", require("./routes/expenseRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/api/transaction", require("./routes/transactionRoutes"));
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
