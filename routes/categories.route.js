const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  getCategories,
  getBookStatuses,
  getRentalStatuses,
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", verifyToken, getCategories);
router.get("/b-status", getBookStatuses);
router.get("/r-status", getRentalStatuses);
module.exports = router;
