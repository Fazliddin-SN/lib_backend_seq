const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
const { CustomError } = require("../utils/customError.js");
const { User, UserRoles, Library, LibraryMember } = require("../models");

exports.authController = {
  //REGISTER PROCESS
  async register(req, res, next) {
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

      //HASH THE PASSWORD
      const hashedPassword = await bcrypt.hash(body.password, 10);
      // CREATE NEW USER AND SIGN NEW JWT TOKEN
      const newUser = await User.create({ ...body, password: hashedPassword });
      //GENERATE TOKEN
      const token = jwt.sign(
        {
          id: newUser.id,
          role_id: newUser.role_id,
          fullname: newUser.fullname,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1d" }
      );

      res.status(201).json({
        message: "Yangi foydalnuvchi qo'shildi!",
        token,
      });
    } catch (error) {
      console.error("Failed to register ", error);
      next(error);
    }
  },

  //LOGIN CONT
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      // CHECK IF USER EXISTS
      console.log("username ", password, username);

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }

      //GENERATE TOKEN
      const token = jwt.sign(
        {
          id: user.id,
          role_id: user.role_id,
          fullname: user.fullname,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1d" }
      );

      res.status(200).json({
        message: "Login successfull",
        user,
        token,
      });
    } catch (error) {
      console.error("Failed to login", error);
      next(error);
    }
  },

  // FETCH USERS LIST
  async usersList(req, res, next) {
    const page = req.query.page || 0;
    const size = req.query.size || 50;
    try {
      // FETCH ALL USERS
      const { count, rows } = await User.findAndCountAll({
        order: [["id", "ASC"]],
        offset: size * page,
        limit: size,
        include: [
          { model: UserRoles, as: "role" }, // Role info
          { model: Library, as: "library" }, // for owners
          {
            model: LibraryMember,
            as: "members",
            include: [
              {
                model: Library,
                as: "library",
                attributes: ["name"],
              },
            ],
          }, // for regular users
        ],
      });

      res.status(200).json({
        users: rows,
        totalItems: count,
        totalPages: Math.ceil(count / size),
        currentPage: page,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to load users ", error);
      next(error);
    }
  },

  // DELETE USER
  async deleteUser(req, res, next) {
    const { id } = req.params;
    try {
      await User.destroy({
        where: { id },
      });
      res.status(200).json({
        message: "User deleted!",
      });
    } catch (error) {
      console.error("Failed to delete user ", error);
      res.status(400).json({
        error: error.message,
      });
    }
  },

  //UPDATE USER DATA
  async updateUser(req, res, next) {
    const { id } = req.params;
    const body = req.body;
    try {
      // CHECK USER EXISTENCE
      const user = await User.findOne({ where: { id } });
      if (!user) {
        throw new CustomError("Bu id bilan foydalanuvchi topilmadi. ", 404);
      }
      //HASH THE PASSWORD AND UPDATE DATE
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const [updatedCount, [updatedUser]] = await User.update(
        {
          ...body,
          password: hashedPassword,
        },
        { where: { id }, returning: true }
      );
      if (updatedCount === 0) {
        throw new CustomError("Foydalanuvchi malumotlari tahrirlanmadi.", 400);
      }

      res.status(200).json({
        message: `Azo malumotlari tahrirlandi. `,
        updatedUser,
      });
    } catch (error) {
      console.error("Failed to update user data ", error);
      next(error);
    }
  },

  //FETCH ROLES
  async roles(req, res, next) {
    try {
      const roles = await UserRoles.findAll();
      res.status(200).json(roles);
    } catch (error) {
      console.error("Failed to fetch roles ", error);
      res.status(400).json({
        error: error.message,
      });
    }
  },
};
