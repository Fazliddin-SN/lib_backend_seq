const express = require("express");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const { fetchLibs } = require("../controllers/admin/adminActionsController");

const router = express.Router();

router.get("/libs", verifyToken, roleGuard(1), fetchLibs);

module.exports = router;
