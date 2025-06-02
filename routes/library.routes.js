const express = require("express");

const { libraryController } = require("../controllers/library.controller");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware");

const router = express.Router();
//CREATE NEW LIBRARY
router.post("/", verifyToken, roleGuard(1), libraryController.createLib);
//GET LIB BY OWNER ID
//UPDATE LIB BY OWNER ID
//DELETE LIB BY OWNER ID

// REGISTER MEMBERS
// GET ALL MEMBERS
// UPDATE MEMBER
// DELETE MEMBER

module.exports = router;
