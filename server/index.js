const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware (The Gatekeepers)
app.use(cors()); // Lets React talk to this server
app.use(express.json()); // Teaches Express to read incoming JSON data from requests

// Import Route Files
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Test route to make sure the server is alive
app.get("/", (req, res) => {
  res.send("Noted. API is running...");
});

// Define our port (uses environment port or defaults to 5000)
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/noted")
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
