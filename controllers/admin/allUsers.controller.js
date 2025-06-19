const { CustomError } = require("../../utils/customError");
const { User, UserRoles, Library } = require("../../models");
const bcrypt = require("bcrypt");
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
    console.error(`Foydalanuvchi malumotlari tahrirlanmadi. `, error);
  }
};
