const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  createRental,
  fetchRentals,
} = require("../controllers/rentals.controller");

const router = express.Router();

router.post("/", verifyToken, roleGuard(2), createRental);
router.get("/", verifyToken, roleGuard(2), fetchRentals);

module.exports = router;
