// src/index.js
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/database");
const morgan = require("morgan");

const errorHandler = require("../utils/errorHandler");
const indexRouter = require("../routes/index");
const app = express();

const PORT = process.env.PORT || 3018;

//MIDDLE FUNCTIONS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
// DATABASE CONNECTION
connectDB();
// ROUTE HADLER
app.use("/", indexRouter);
app.get("/", (req, res) => {
  res.send("Library Backend is running");
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

// SERVER RUNNING
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
