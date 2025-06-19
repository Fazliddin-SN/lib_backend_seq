const { CustomError } = require("../../utils/customError");
const { User, UserRoles, Library } = require("../../models");

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
