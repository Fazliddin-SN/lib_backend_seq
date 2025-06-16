const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  createRental,
  fetchRentals,
  updateRental,
} = require("../controllers/rentals.controller");

const router = express.Router();

//create a new rental
router.post("/", verifyToken, roleGuard(2), createRental);

//fetch all rentals
router.get("/", verifyToken, roleGuard(2), fetchRentals);

// update rental by id
router.put("/:rentalId", verifyToken, roleGuard(2), updateRental);

module.exports = router;
