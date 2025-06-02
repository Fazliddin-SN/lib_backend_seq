const express = require("express");
const { validateUser } = require("../middlewares/validationMiddleware");
const {
  libraryController,
  libraryMemberController,
} = require("../controllers/library.controller");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");

const router = express.Router();

//GET ALL LIBRARIES
router.get("/", verifyToken, roleGuard(1), libraryController.getAllLibs);

//CREATE NEW LIBRARY
router.post("/", verifyToken, roleGuard(1), libraryController.createLib);

//GET LIB BY OWNER ID
router.get("/:id", verifyToken, roleGuard(1), libraryController.getLibById);

//UPDATE LIB BY OWNER ID
router.put("/:id", verifyToken, roleGuard(1, 2), libraryController.updateLib);

//DELETE LIB BY OWNER ID
router.delete("/:id", verifyToken, roleGuard(1), libraryController.deleteLib);

// REGISTER MEMBERS
router.post(
  "/members",
  validateUser,
  verifyToken,
  roleGuard(2),
  libraryMemberController.addMember
);

// GET ALL MEMBERS
router.get(
  "/members/info",
  verifyToken,
  roleGuard(2),
  libraryMemberController.getLibMembers
);

// UPDATE MEMBER
router.put(
  "/members/:member_id",
  validateUser,
  verifyToken,
  roleGuard(2),
  libraryMemberController.updateLibMember
);

// DELETE MEMBER
router.delete(
  "/members/:member_id",
  verifyToken,
  roleGuard(2),
  libraryMemberController.removeMember
);

module.exports = router;
