const { CustomError } = require("../utils/customError");
const path = requrie("path");
const { Book, BookStatus } = require("../models");
exports.bookController = {
  async addBook(req, res, next) {
    const owner_id = req.user.id;
  },
};
