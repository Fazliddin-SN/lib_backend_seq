const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  getAllReviews,
  fetchCurrentUserReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews.controller");
const {
  ensureHasRead,
  canEditReview,
} = require("../middlewares/reviewsMiddleware");

const router = express.Router();

// GET all reviews for a book
// GET /books/:bookId/reviews
router.get(
  "/books/:bookId/reviews",
  verifyToken,
  roleGuard(1, 2),
  getAllReviews
);

// GET current user's reviews
// GET /users/:userId/reviews
router.get("/users/:userId/reviews", verifyToken, fetchCurrentUserReviews);

// CREATE a new review
// POST /books/:bookId/reviews
router.post("/books/:bookId/reviews", verifyToken, ensureHasRead, createReview);

// UPDATE a review
// PATCH /reviews/:id
router.patch("/reviews/:id", verifyToken, canEditReview, updateReview);

// DELETE a review
// DELETE /reviews/:id
router.delete("/reviews/:id", verifyToken, canEditReview, deleteReview);

module.exports = router;
