const express = require("express");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const {
  fetchLibs,
  updateLib,
} = require("../controllers/admin/adminActionsController");
const {
  fetchAllUsers,
  updateUser,
} = require("../controllers/admin/allUsers.controller");
const { validateUser } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.get("/libs", verifyToken, roleGuard(1), fetchLibs);
// udpate lib
router.put("/libs/:libId", verifyToken, roleGuard(1), updateLib);

router.get("/users", verifyToken, roleGuard(1), fetchAllUsers);

router.put(
  "/users/:userId",
  validateUser,
  verifyToken,
  roleGuard(1),
  updateUser
);
module.exports = router;
