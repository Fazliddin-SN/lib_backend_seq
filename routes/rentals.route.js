const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  createRental,
  fetchRentals,
  updateRental,
  updateRentalReturn,
  fetchOverDueRentals,
  fetchRentalById,
} = require("../controllers/rentals.controller");

const router = express.Router();

//create a new rental
router.post("/", verifyToken, roleGuard(2), createRental);

//fetch all rentals
router.get("/", verifyToken, roleGuard(2), fetchRentals);

// update rental by id
router.put("/:rentalId/edit", verifyToken, roleGuard(2), updateRental);

//update actual return date
router.put("/delete", verifyToken, roleGuard(2), updateRentalReturn);

//fetching overdueRentals
router.get("/overdue", verifyToken, roleGuard(2), fetchOverDueRentals);

// fetching rental by id
router.get("/:rental_id", verifyToken, roleGuard(2), fetchRentalById);

module.exports = router;
