const { CustomError } = require("../utils/customError");
const {
  Library,
  User,
  Book,
  LibraryMember,
  Category,
  Rental,
} = require("../models");
const { Op } = require("sequelize");
const { notifyMember, notifyOwner } = require("./notifications.controller");

// Format dates as YYYY-MM_DD
const fmt = (d) => {
  const date = new Date(d);
  if (!isNaN(date)) {
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tashkent",
    });
  } else {
    console.log("Invalid date");
  }
};

exports.createRental = async (req, res, next) => {
  const owner_id = req.user.id;
  const { user_id, book_id, rental_date, due_date, return_date } = req.body;
  try {
    //parse into jsDates
    const rentalDt = new Date(rental_date);
    const dueDt = new Date(due_date);
    const returnDate = new Date(return_date);

    // 1) rental_date must be on or before due_date and return_date
    if (rentalDt > dueDt || rentalDt > returnDate) {
      throw new CustomError(
        "Ijaraga berish sanasi ogohlantirish yoki qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }
    // 2) due_date must be on or before return_date
    if (dueDt > returnDate) {
      throw new CustomError(
        "Ogohlantirish sanasi qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }

    const library = await Library.findOne({ where: { owner_id } });
    if (!library) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu user uchun",
        404
      );
    }

    const member = await User.findOne({
      where: { id: user_id },
    });
    if (!member || member.length === 0) {
      throw new CustomError("foydalanuvchi topilmadi bu id bilan!");
    }

    const book = await Book.findOne({
      where: { id: book_id },
    });
    if (!book || book.length === 0) {
      throw new CustomError("Kitob topilmadi bu id bilan!");
    }

    const newRental = await Rental.create({
      user_id: member.id,
      owner_id,
      book_id: book.id,
      rental_date,
      due_date,
      return_date,
    });
    if (!newRental || newRental.length === 0) {
      throw new CustomError("Yangi ijara yaratilmadi.", 400);
    }
    // update book status to 'ijarada'
    await Book.update(
      {
        status_id: 2,
      },
      { where: { id: book.id } }
    );

    //NOTIFICATIONS HERE
    const ownerTgData = await User.findOne({
      where: { id: owner_id },
      attributes: ["id", "fullname", "telegram_chat_id"],
    });

    // notify member
    if (member.telegram_chat_id) {
      await notifyMember(
        member.telegram_chat_id,
        book.title,
        library.name,
        fmt(rental_date),
        fmt(due_date),
        fmt(return_date),
        null
      );
    }

    // notify the owner
    if (ownerTgData.telegram_chat_id) {
      await notifyOwner(
        ownerTgData.telegram_chat_id,
        member.fullname,
        book.title,
        fmt(rental_date),
        fmt(due_date),
        fmt(return_date),
        null
      );
    }

    res.status(201).json({
      message: "Ijara yaratildi",
      rental: newRental,
    });
  } catch (error) {
    console.error("Failed to create new rental", 400);
    next(error);
  }
};

//FETCH ALL RENTALS THAT BELONG TO A SPECIFIC OWNER
exports.fetchRentals = async (req, res, next) => {
  const owner_id = req.user.id;
  const page = req.query.page || 0;
  const size = req.query.size || 50;

  try {
    //initializing where clause
    const whereClause = {};
    whereClause.owner_id = owner_id;

    const library = await Library.findOne({ where: { owner_id } });
    if (!library) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu user uchun",
        404
      );
    }

    const { count, rows } = await Rental.findAndCountAll({
      where: {
        owner_id,
      },
      order: [["id", "ASC"]],
      offset: page * size,
      limit: size,
      include: [
        {
          model: User,
          as: "member",
          attributes: { exclude: ["password"] },
        },
        {
          model: Book,
          include: [
            {
              model: Library,
              as: "library",
              include: [
                {
                  model: User,
                  as: "owner",
                  attributes: { exclude: ["password"] },
                },
              ],
            },
            {
              model: Category,
              as: "category",
            },
          ],
        },
      ],
    });

    const rentsss = await Rental.findAndCountAll({
      where: {
        owner_id,
      },
      order: [["id", "ASC"]],
      offset: page * size,
      limit: size,
      include: [
        {
          model: User,
          as: "member",
          attributes: { exclude: ["password"] },
        },
        {
          model: Book,
          include: [
            {
              model: Library,
              as: "library",
              include: [{ model: User, as: "owner" }],
            },
            {
              model: Category,
              as: "category",
            },
          ],
        },
      ],
    });
    console.log("rentals ", rentsss);

    if (!rows || rows.length === 0) {
      throw new CustomError("Ijaralar topilmadi. ", 404);
    }

    res.status(200).json({
      rentals: rows,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
    });
  } catch (error) {
    console.error("Failed to fetch rentals ", error);
    next(error);
  }
};
