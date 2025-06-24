const { CustomError } = require("../utils/customError");
const {
  Library,
  User,
  Book,
  LibraryMember,
  Category,
  Rental,
  ReadBooks,
} = require("../models");
const { Op } = require("sequelize");

// GET LIBRARY DETAILS FOR THEIR MEMBERS
exports.getLibsDetailsForMembers = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const memberDetails = await LibraryMember.findAll({
      where: { user_id: userId },
    });
    if (!memberDetails || !memberDetails.length === 0) {
      throw new CustomError("Bu id bilan hech qandat azolik topilmadi!", 404);
    }

    // Extract library IDs from memberDetails array
    const libraryIds = memberDetails.map((member) => member.library_id);

    const result = await Library.findAll({
      where: { id: libraryIds },
      include: {
        model: User,
        as: "owner",
        attributes: { exclude: ["password", "username", "avatar"] },
      },
    });
    if (!result || result.length === 0) {
      throw new CustomError(
        "Azolik bo'yicha hech qanday malumot topilmadi!",
        404
      );
    }

    res.status(200).json({
      libraries: result,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch lib details", error);
    next(error);
  }
};

// GET ALL AVAILABLE BOOKS FROM LIBRARIES FOR THEIR MEMBERS
exports.getAllAvailableBooksForMem = async (req, res, next) => {
  const userId = req.user.id;
  const page = req.query.page || 0;
  const size = req.query.size || 50;

  const { library_name, owner_fullname, category_id } = req.query;
  try {
    // initializing where clause
    const whereClause = {};
    const libraryWhere = {}; // for included Library  (library)
    const ownerWhere = {}; // for included User (owner)
    const categoryWhere = {}; //

    if (library_name) {
      libraryWhere.name = { [Op.like]: `%${library_name}%` };
    }

    if (owner_fullname) {
      ownerWhere.fullname = { [Op.like]: `%${owner_fullname}%` };
    }

    if (category_id) {
      categoryWhere.id = category_id;
    }

    // First, get all library_ids the user is a member of
    const memberships = await LibraryMember.findAll({
      where: { user_id: userId },
      attributes: ["library_id"],
    });

    const libraryIds = memberships.map((m) => m.library_id);
    if (libraryIds.length === 0) {
      throw new CustomError(
        "Foydalanuvchi hech bir kutubxonaga a'zo emas!",
        404
      );
    }

    whereClause.status_id = 1;
    whereClause.library_id = libraryIds;

    const { count, rows } = await Book.findAndCountAll({
      where: whereClause,
      order: [["title", "ASC"]],
      offset: page * size,
      limit: size,
      include: [
        {
          model: Library,
          as: "library",
          where:
            Object.keys(libraryWhere).length > 0 ? libraryWhere : undefined,
          include: [
            {
              model: User,
              as: "owner",
              where:
                Object.keys(ownerWhere).length > 0 ? ownerWhere : undefined,
              attributes: { exclude: ["password"] },
            },
          ],
        },
        {
          model: Category,
          where:
            Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
          as: "category",
        },
      ],
    });

    if (rows.length === 0) {
      throw new CustomError(
        "Hozirda mavjud bo'lgan kitoblar topilmadi kutubxonalarda!",
        404
      );
    }

    res.status(200).json({
      status: "ok",
      books: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / size),
    });
  } catch (error) {
    console.error("Error fetching available books for user: ", error);
    next(error);
  }
};

// SHOW THE BOOKS THAT THE MEMBER HAS BORROWED AND CURRENTLY HAS.
exports.getBorrowedBooks = async (req, res, next) => {
  const userId = req.user.id;

  const page = req.query.page || 0;
  const size = req.query.size || 50;
  try {
    const { count, rows } = await Rental.findAndCountAll({
      where: { user_id: userId },
      order: [["id", "ASC"]],
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author"],
          include: [
            {
              model: Library,
              as: "library",
              attributes: ["id", "name"],
              include: [
                {
                  model: User,
                  as: "owner",
                  attributes: ["id", "fullname", "username"],
                },
              ],
            },
          ],
        },
      ],
    });
    if (rows.length === 0) {
      throw new CustomError("Siz uchu hech qanday ijara topilmadi.", 404);
    }

    res.status(200).json({
      rentals: rows,
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
    });
  } catch (error) {
    console.error("Error fetching available rentals for user: ", error);
    next(error);
  }
};

// fetching books that the requester user has read
exports.getReadBooks = async (req, res, next) => {
  const { id } = req.user.id;
  const page = req.query.page || 0;
  const size = req.query.size || 50;

  try {
    const { count, rows } = await ReadBooks.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Book,
          as: "book",
          include: [
            { model: Library, as: "library", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["returned_on", "ASC"]],
      offset: page * size,
      limit: size,
    });

    req.status(200).json({
      readBooks: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      status: "ok",
    });
  } catch (error) {
    console.error("Error fetching read books for user: ", error);
    next(error);
  }
};
