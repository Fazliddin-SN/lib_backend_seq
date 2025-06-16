const bcrypt = require("bcrypt");
const { CustomError } = require("../utils/customError");
const { Library, User, BookStatus, LibraryMember } = require("../models");

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

// LIBRARY MEMBER CONTROLLER
exports.libraryMemberController = {
  // GET LIBRARY MEMBERS
  async getLibMembers(req, res, next) {
    const owner_id = req.user.id;
    const page = req.query.page || 0;
    const size = req.query.size || 50;

    try {
      // Build the where clause based on query parameters
      const whereClause = {};

      // CHECK LIBARY EXISTS WITH THIS OWNER ID
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError("Bu owner_id bilan kutubxona topilmadi. ", 404);
      }

      //if category_id is provided, add it to where clause
      if (library) {
        whereClause.library_id = library.id;
      }
      // GET MEMBERS
      const { count, rows } = await LibraryMember.findAndCountAll({
        where: whereClause,
        order: [["id", "ASC"]],
        offset: size * page,
        limit: size,
        include: [
          { model: User, as: "user", attributes: { exclude: ["password"] } },
        ],
      });

      res.status(200).json({
        members: rows,
        totalItems: count,
        totalPages: Math.ceil(count / size),
        currentPage: page,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to fech members ", error);
      next(error);
    }
  },

  // ADD NEW MEMBER
  async addMember(req, res, next) {
    const owner_id = req.user.id;
    const body = req.body;

    try {
      // CHECK IF USERS EXISTS OR NOT WITH THIS EMAIL
      const userExists = await User.findOne({
        where: { email: body.email },
      });
      if (userExists) {
        throw new CustomError(
          "Bu email bilan allaqachon foydalanuvchi mavjud! Iltimos boshqa email bilan urinib ko'ring.",
          400
        );
      }

      // CHECK LIBARY EXISTS WITH THIS OWNER ID
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError("Bu owner_id bilan kutubxona topilmadi. ", 404);
      }

      // HASH THE PASSWORD AND CREATE NEW USER
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const newUser = await User.create({ ...body, password: hashedPassword });
      if (!newUser) {
        throw new CustomError("Yangi Foydalanuvchi qo'shilmadi. ", 400);
      }

      //CREATE NEW LIBRARY MEMBER
      const newMember = await LibraryMember.create({
        user_id: newUser.id,
        library_id: library.id,
      });
      if (!newMember) {
        throw new CustomError("Yangi kutubxona azo qo'shilmadi. ", 400);
      }

      res.status(201).json({
        message: "Yangi foydalanuvchi qo'shildi. ISM:" + body.fullname,
        newMember,
      });
    } catch (error) {
      console.error("Failed to add new member ", error);
      next(error);
    }
  },
  // register memner with username
  async addMemberWithUsername(req, res, next) {
    const owner_id = req.user.id;
    const { username } = req.query;

    try {
      const member = await User.findOne({
        where: { username },
      });
      if (!member) {
        throw new CustomError(
          "Bu username bilan foydalanuvchi topilmadi. ",
          404
        );
      }

      // CHECK LIBARY EXISTS WITH THIS OWNER ID
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError("Bu owner_id bilan kutubxona topilmadi. ", 404);
      }

      // check if this user has not been join this library before
      const libMember = await LibraryMember.findOne({
        where: { user_id: member.id, library_id: library.id },
      });
      if (libMember) {
        throw new CustomError(
          "Bu Foydalanuvchi allaqachon sizning kutubxonangiz azosi!",
          400
        );
      }

      //CREATE NEW LIBRARY MEMBER
      const newMember = await LibraryMember.create({
        user_id: member.id,
        library_id: library.id,
      });
      if (!newMember) {
        throw new CustomError("Yangi kutubxona azo qo'shilmadi. ", 400);
      }

      res.status(201).json({
        message: "Yangi foydalanuvchi qo'shildi. ISM:" + member.fullname,
        newMember,
      });
    } catch (error) {
      console.error("Failed to add new memeber with username", error);
      next(error);
    }
  },

  // UPDATE THE LIBRARY MEMBER
  async updateLibMember(req, res, next) {
    const { member_id } = req.params;
    const owner_id = req.user.id;
    const body = req.body;
    try {
      // CHECK LIBARY EXISTS WITH THIS OWNER ID
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError("Bu owner_id bilan kutubxona topilmadi. ", 404);
      }

      // FIND MEMBER
      const member = await LibraryMember.findOne({
        where: {
          user_id: member_id,
          library_id: library.id,
        },
      });
      if (!member) {
        throw new CustomError("Bu id bilan foydalanuvchi topilmadi.! ", 404);
      }

      // HASH THE PASSWORD AND CREATE NEW USER
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const [updatedCount, [updatedUser]] = await User.update(
        {
          ...body,
          password: hashedPassword,
        },
        { where: { id: member_id }, returning: true }
      );
      if (updatedCount === 0) {
        throw new CustomError("Foydalanuvchi malumotlari tahrirlanmadi.", 400);
      }

      res.status(200).json({
        message: `Azo malumotlari tahrirlandi. `,
        updatedUser,
      });
    } catch (error) {
      console.error("Failed to update member data ", error);
      next(error);
    }
  },

  //DELETE LIBRARY MEMBER BY ID
  async removeMember(req, res, next) {
    const { member_id } = req.params;
    const owner_id = req.user.id;

    try {
      // CHECK LIBARY EXISTS WITH THIS OWNER ID
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError("Bu owner_id bilan kutubxona topilmadi. ", 404);
      }

      // REMOVE MEMBER
      const deletCount = await LibraryMember.destroy({
        where: {
          user_id: member_id,
          library_id: library.id,
        },
      });
      if (deletCount === 0) {
        throw new CustomError("Bu id bilan foydalanuvchi topilmadi.! ", 404);
      }

      res.status(200).json({
        message: "A'zo muvaffaqiyatli o'chirildi.",
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to remove member", error);
      next(error);
    }
  },
};
