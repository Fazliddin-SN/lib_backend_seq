const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { bucketName, storage, deleteFromGCS } = require("../middlewares/gcs.js");
require("dotenv").config();
const { CustomError } = require("../utils/customError.js");
const { User, UserRoles } = require("../models");

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
      const newUser = await User.create(body);
      //GENERATE TOKEN
      const token = jwt.sign(
        {
          id: newUser.user_id,
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
          id: newUser.user_id,
          role_id: newUser.role_id,
          fullname: newUser.fullname,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1d" }
      );

      res.status(200).json({
        message: "Login successfull",
        token,
      });
    } catch (error) {
      console.error("Failed to login", error);
      next(error);
    }
  },

  // FETCH USERS LIST
  async usersList(req, res, next) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Failed to load users ");
      res.status(400).json({
        error: error.message,
      });
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
