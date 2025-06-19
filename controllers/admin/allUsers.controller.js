const { CustomError } = require("../../utils/customError");
const { User, UserRoles, Library } = require("../../models");
const bcrypt = require("bcrypt");
const user = require("../../models/user");
exports.fetchAllUsers = async (req, res, next) => {
  const page = req.query.page || 0;
  const size = req.query.size || 50;
  try {
    const { count, rows } = await User.findAndCountAll({
      order: [["id", "ASC"]],
      offset: page * size,
      limit: size,
      include: [{ model: UserRoles, as: "role" }],
    });

    if (!rows || rows.length === 0) {
      throw new CustomError("Foydaluvchilar topilmadi. ", 404);
    }

    res.status(200).json({
      users: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch users ", error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
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
};

exports.registerUser = async (req, res, next) => {
  const body = req.body;

  try {
    const userExist = await User.findOne({
      where: { email: body.email },
    });
    if (userExist) {
      throw new CustomError(
        "Bu email bilan allaqachon ro'yxatdan otilgan. ",
        400
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await User.create(req.body);
    if (!newUser) {
      throw new CustomError("Yangi foydalanuvchi qoshilmadi.", 400);
    }

    res.status(201).json({
      message: "Yangi foydalanuvchi qoshildi.",
      status: "ok",
      user: newUser,
    });
  } catch (error) {
    console.error("Failed to register new User ", error);
    next(error);
  }
};
