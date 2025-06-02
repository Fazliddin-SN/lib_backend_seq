const bcrypt = require("bcrypt");
const { CustomError } = require("../utils/customError");
const { Library, User, BookStatus } = require("../models");

exports.libraryController = {
  // CREATE NEW LIB FOR OWNER ROLE USERS
  async createLib(req, res, next) {
    const { library_name, email } = req.body;
    try {
      if (!library_name || !email) {
        throw new CustomError(
          "Kutubxona nomi  va email kiritilishi shart!",
          400
        );
      }
      // CHECK USER EXISTS
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new CustomError("Bu email bilan foydalanuvchi topilmadi. ", 404);
      }

      // CREATE NEW LIB
      const newLibrary = await Library.create({
        name: library_name,
        owner_id: user.id,
      });
      if (!newLibrary) {
        throw new CustomError("Kutubxona yaratilmadi.", 400);
      }

      res.status(201).json({
        message:
          "Kutubxona yaratildi nomi: " +
          library_name +
          ". Egasi: " +
          user.fullname,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to create library ", error);
      next(error);
    }
  },
};
