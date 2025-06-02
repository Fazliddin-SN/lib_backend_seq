// src/index.js
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/database");
const errorHandler = require("../utils/customError");
const app = express();

const PORT = process.env.PORT || 3018;

app.use(
  cors({
    origin: /^http:\/\/localhost:\d+$/, // Allow all localhost ports
    credentials: true, // Include this if you need cookies or authentication headers
  })
);

connectDB();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Financial Tracker Backend is running");
});

app.get("/api/protected", verifyToken, requireRole("ADMIN"), (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route for admins only" });
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
