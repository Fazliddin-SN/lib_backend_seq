const express = require("express");

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  getLibsDetailsForMembers,
  getAllAvailableBooksForMem,
  getBorrowedBooks,
  getReadBooks,
} = require("../controllers/members.controller");

const router = express.Router();

// get lib details for their members
router.get("/libraries", verifyToken, roleGuard(3), getLibsDetailsForMembers);

//get available books from libs for their members
router.get(
  "/available-books",
  verifyToken,
  roleGuard(3),
  getAllAvailableBooksForMem
);

// get borrowed books
router.get("/borrowed-books", verifyToken, roleGuard(3), getBorrowedBooks);

// get the books that user has read
router.get("/read-books", verifyToken, roleGuard(3), getReadBooks);

module.exports = router;
