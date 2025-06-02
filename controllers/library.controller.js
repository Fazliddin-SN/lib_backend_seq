const bcrypt = require("bcrypt");
const { CustomError } = require("../utils/customError");
const { Library, User, BookStatus } = require("../models");

exports.libraryController = {
  // GET ALL LIBRARIES
  async getAllLibs(req, res, next) {
    const page = req.query.page || 0;
    const size = req.query.size || 50;

    try {
      // FETCH ALL LIBRARIES DATA
      const { count, rows } = await Library.findAndCountAll({
        order: [["id", "asc"]],
        offset: page * size,
        limit: size,
        include: [
          { model: User, as: "owner", attributes: { exclude: ["password"] } },
        ],
      });

      res.status(200).json({
        libraries: rows,
        totalItems: count,
        totalPages: Math.ceil(count / size),
        currentPage: page,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to fetch libraries data ", error);
      next(error);
    }
  },
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

  //UPDATE THE LIB DATA
  async updateLib(req, res, next) {
    const { library_name } = req.body;
    const { id } = req.params;

    try {
      //  VALIDATION CHECK
      if (!library_name) {
        throw new CustomError("Kutubxona nomi kiritilishi kerak! ", 400);
      }

      // CHECK LIBRARY EXISTS
      const library = await Library.findOne({ where: { id } });
      if (!library) {
        throw new CustomError("Kutubxona topilmadi bu id bilan ", 404);
      }

      // UDPATE LIB DATA
      await Library.update({ name: library_name }, { where: { id } });

      res.status(200).json({
        message: `Kutubxona nomi ${library_name} ga o'zgartirildi. `,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to update library data ", error);
      next(error);
    }
  },

  // GET LIB DATA BY ID
  async getLibById(req, res, next) {
    const { id } = req.params;

    try {
      // CHECK LIBRARY EXISTS
      const library = await Library.findOne({
        where: { id },
        include: [{ model: User, as: "owner" }],
      });
      if (!library) {
        throw new CustomError("Kutubxona topilmadi", 404);
      }

      res.status(200).json({
        library,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to fetch library data by owner id ", error);
      next(error);
    }
  },

  // DELETE LIBRARY DATA
  async deleteLib(req, res, next) {
    const { id } = req.params;
    try {
      // CHECK LIBRARY EXISTS
      await Library.destroy({
        where: { id },
      });
      res.status(200).json({
        message: "Kutubxone o'chirildi",
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to delete library data by owner id ", error);
      next(error);
    }
  },
};
