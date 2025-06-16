const express = require("express");

const router = express.Router();

// AUTH ROUTER
const authRoute = require("../routes/auth.routes");
router.use("/auth", authRoute);

// LIBRARY ROUTE
const libraryRoute = require("./library.routes");
router.use("/library", libraryRoute);

// BOOK ROUTE
const bookRoute = require("./books.routes");
router.use("/books", bookRoute);

//CATEGORIES ROUTE
const categoriesRoute = require("./categories.route");
router.use("/categories", categoriesRoute);

// ADMIN ROUTES
const adminRoute = require("./admin.routes");
router.use("/admin", adminRoute);

const membersRoute = require("./members.route");
router.use("/members", membersRoute);

module.exports = router;
