const express = require("express");

const router = express.Router();

const { validateBookSchema } = require("../middlewares/validationMiddleware");
const { bookController } = require("../controllers/book.controller");
const { upload } = require("../middlewares/uplaod");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");

//add
router.post(
  "/",
  upload.single("image"),
  validateBookSchema,
  verifyToken,
  roleGuard(2),
  bookController.addBook
);

//update
router.put(
  "/:id/edit",
  upload.single("image"),
  validateBookSchema,
  verifyToken,
  roleGuard(2),
  bookController.updateBook
);

// delete
router.delete("/:id", verifyToken, roleGuard(2), bookController.deleteBook);

// get book by its id
router.get("/:id/edit", verifyToken, roleGuard(2), bookController.getBookById);

//fetch all books
router.get("/", verifyToken, roleGuard(2), bookController.getBooksByLib);

// fetch available books
router.get(
  "/avialable",
  verifyToken,
  roleGuard(2),
  bookController.getAvailableBooks
);
module.exports = router;
