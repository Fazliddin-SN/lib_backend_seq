const express = require("express");

const router = express.Router();

// AUTH ROUTER
const authRoute = require("../routes/auth.routes");
router.use("/auth", authRoute);

module.exports = router;
