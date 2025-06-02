const express = require("express");

const router = express.Router();

// AUTH ROUTER
const authRoute = require("../routes/auth.routes");
router.use("/auth", authRoute);

// LIBRARY ROUTE
const libraryRoute = require("./library.routes");
router.use("/library", libraryRoute);

module.exports = router;
