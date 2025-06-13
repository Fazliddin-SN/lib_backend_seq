const { CustomError } = require("../../utils/customError");
const { User, UserRoles, Library } = require("../../models");

// FETCHING ALL LIBS
exports.fetchLibs = async (req, res, next) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 50;
  const { library_name, username } = req.query;
  try {
    // creating whereClause
    const whereClause = {};

    if (library_name) {
      whereClause.name = library_name;
    }

    //Admin filter (for username)
    const userInclude = {
      model: User,
      as: "owner",
      attributes: ["fullname", "username", "address", "phonenumber"],
    };

    if (username) {
      userInclude.where = { username };
    }

    const { rows, count } = await Library.findAndCountAll({
      where: whereClause,
      order: [["id", "ASC"]],
      offset: page * size,
      limit: size,
      include: [userInclude],
    });

    if (!rows.length === 0) {
      throw new CustomError("Kutubxonalar topilmadi", 404);
    }

    res.status(200).json({
      libraries: rows,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch libraries ", error);
    next(error);
  }
};
