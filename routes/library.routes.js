const express = require("express");

const { libraryController } = require("../controllers/library.controller");
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
// GET ALL MEMBERS
// UPDATE MEMBER
// DELETE MEMBER

module.exports = router;
