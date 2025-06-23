const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");
const { validateUser } = require("../middlewares/validationMiddleware");
const { upload } = require("../middlewares/uplaod");
const router = express.Router();

// REGISTER ROUTE
router.post("/register", validateUser, authController.register);
//LOGIN ROUTE
router.post("/login", authController.login);
// USERS LIST
router.get("/users", verifyToken, roleGuard(1), authController.usersList);
// UPDATE USER
router.put(
  "/users/:userId",
  validateUser,
  verifyToken,
  roleGuard(1),
  authController.updateUser
);

//DELETE USER
router.delete(
  "/:userId/delete",
  verifyToken,
  roleGuard(1),
  authController.deleteUser
);

// get profile data
router.get("/me", verifyToken, authController.getUserDetails);
// edit profile
router.put(
  "/update",
  upload.single("avatar"),
  verifyToken,
  authController.editProfile
);

//ROLE ROUTE
router.get("/roles", authController.roles);

module.exports = router;
