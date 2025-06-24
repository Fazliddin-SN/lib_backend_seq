const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();
const { CustomError } = require("../utils/customError.js");
const { User, UserRoles, Library, LibraryMember } = require("../models");

// load avatar data
const loadAvatar = async (user) => {
  if (!user.avatar) {
    user.setDataValue("imageData", null);
    return;
  }

  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    "users-avatars",
    `user-${user.id}.jpg`
  );
  try {
    const buf = await fs.promises.readFile(filePath);

    const base64 = buf.toString("base64");

    // // detect the mime type from its extension
    // const mimeType = mime.lookup(filePath) || "application/octet-stream";
    const mimeType = "image/jpeg"; // or detect by extension

    user.setDataValue("imageData", `data:${mimeType};base64,${base64}`);
  } catch (error) {
    user.setDataValue("imageData", null);
  }
};
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

      const user = await User.findOne({
        where: { username },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await loadAvatar(user);

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
          // 2️⃣ The library they own (if any)
          {
            model: Library,
            as: "library",
          },
          {
            model: LibraryMember,
            as: "member",
            include: [
              {
                model: Library,
                as: "library",
                attributes: ["id", "name"],
              },
            ],
          },
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
    const { userId } = req.params;
    try {
      await User.destroy({
        where: { id: userId },
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
    const { userId } = req.params;

    try {
      const user = await User.findOne({ where: { id: userId } });
      if (!user || user.length === 0) {
        throw new CustomError("Bu id bilan foydalanuvchi topilmadi ", 404);
      }

      // HASH THE PASSWORD AND CREATE NEW USER
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const [updatedCount, [updatedUser]] = await User.update(
        {
          ...req.body,
          password: hashedPassword,
        },
        { where: { id: user.id }, returning: true }
      );
      if (updatedCount === 0) {
        throw new CustomError("Foydalanuvchi malumotlari tahrirlanmadi.", 400);
      }

      res.status(200).json({
        message: `Foydalanuvchi malumotlari tahrirlandi. `,
        updatedUser,
      });
    } catch (error) {
      console.error(`Failed to update user data. `, error);
    }
  },

  //FETCH ROLES
  async roles(req, res, next) {
    try {
      const roles = await UserRoles.findAll();
      res.status(200).json({
        roles,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to fetch roles ", error);
      res.status(400).json({
        error: error.message,
      });
    }
  },
  async getUserDetails(req, res, next) {
    const id = req.user.id;

    try {
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new CustomError("BU id bilan foydalanuvchi topilmadi ", 404);
      }

      await loadAvatar(user);

      await res.status(200).json({
        user,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to fetch user data ", error);
      next(error);
    }
  },

  async editProfile(req, res, next) {
    const id = req.user.id;
    try {
      const body = req.body;
      const file = req.file;

      //existing book
      const user = await User.findOne({
        where: { id },
      });
      if (!user) {
        throw new CustomError("Foydalanuvchi topilmadi!", 404);
      }

      const updatedData = { ...body };
      const oldImage = user.avatar || null;

      if (file) {
        if (oldImage && fs.existsSync(oldImage)) {
          await fs.remove(oldImage);
        }
        const oldPath = file.path;

        const ext = path.extname(file.originalname);
        const newFileName = `user-${user.id}${ext}`;

        const newPath = path.join("uploads", "users-avatars", newFileName);

        await fs.move(oldPath, newPath, { overwrite: true }); // fs-extra move handles file existence better
        updatedData.avatar = newPath;
      }

      const result = await User.update(updatedData, { where: { id } });
      if (!result) {
        throw new CustomError("Profile tahrirlanmadi.", 400);
      }

      res.status(200).json({
        message: "Profile tahrirlandi",
      });
    } catch (error) {
      console.error("Failed to update the Profile data ", error);
      next(error);
    }
  },
};
