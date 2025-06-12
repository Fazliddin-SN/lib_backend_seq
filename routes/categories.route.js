const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { getCategories } = require("../controllers/category.controller");

const router = express.Router();

router.get("/", verifyToken, getCategories);

module.exports = router;
