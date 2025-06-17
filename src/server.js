// src/index.js
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/database");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("../utils/errorHandler");
const indexRouter = require("../routes/index");
const app = express();

require("../utils/scheduler");
const PORT = process.env.PORT || 3020;

//MIDDLE FUNCTIONS
app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ① Turn “uploads/book-images” into a web-accessible folder:
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads/books"))
);

// 2️⃣ For static files under /uploads, allow cross-origin embedding:
app.use("/uploads", (req, res, next) => {
  // you can also use 'same-site' if both apps share the same registrable domain
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

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
