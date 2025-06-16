const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const { createRental } = require("../controllers/rentals.controller");

const router = express.Router();

router.post("/", verifyToken, roleGuard(2), createRental);

module.exports = router;
