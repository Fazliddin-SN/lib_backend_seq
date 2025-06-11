const express = require("express");

const router = express.Router();

const { validateBookSchema } = require("../middlewares/validationMiddleware");
const { bookController } = require("../controllers/book.controller");
const { upload } = require("../middlewares/uplaod");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");

router.post(
  "/",
  upload.single("image"),
  validateBookSchema,
  verifyToken,
  roleGuard(2),
  bookController.addBook
);

router.get("/", verifyToken, roleGuard(2), bookController.getBooksByLib);

module.exports = router;
