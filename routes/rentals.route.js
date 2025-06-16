const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  createRental,
  fetchRentals,
  updateRental,
  updateRentalReturn,
  fetchOverDueRentals,
} = require("../controllers/rentals.controller");

const router = express.Router();

//create a new rental
router.post("/", verifyToken, roleGuard(2), createRental);

//fetch all rentals
router.get("/", verifyToken, roleGuard(2), fetchRentals);

// update rental by id
router.put("/:rentalId", verifyToken, roleGuard(2), updateRental);

//update actual return date
router.post("/delete", verifyToken, roleGuard(2), updateRentalReturn);

//fetching overdueRentals
router.get("/overdue", verifyToken, roleGuard(2), fetchOverDueRentals);

module.exports = router;
