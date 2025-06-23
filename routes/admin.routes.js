const express = require("express");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  fetchLibs,
  updateLib,
} = require("../controllers/admin/adminActionsController");

const router = express.Router();

router.get("/libs", verifyToken, roleGuard(1), fetchLibs);
// udpate lib
router.put("/libs/:libId", verifyToken, roleGuard(1), updateLib);

module.exports = router;
