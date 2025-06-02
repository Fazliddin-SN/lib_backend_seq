const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const { validateUser } = require("../middlewares/validationMiddleware");
const router = express.Router();

// REGISTER ROUTE
router.post("/register", validateUser, authController.register);
//LOGIN ROUTE
router.post("/login", authController.login);
// USERS LIST
router.get("/users", verifyToken, roleGuard(1), authController.usersList);
// UPDATE USER
// router.put("users", verifyToken, roleGuard(1), authController.update);
//DELETE USER
router.delete(
  "/:user_id/delete",
  verifyToken,
  roleGuard(1),
  authController.deleteUser
);

//ROLE ROUTE
router.get("/roles", verifyToken, authController.roles);

module.exports = router;
