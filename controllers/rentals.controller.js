const { CustomError } = require("../utils/customError");
const {
  Library,
  User,
  Book,
  LibraryMember,
  Category,
  RentalStatus,
  Rental,
  ReadBooks,
} = require("../models");
const { Op, fn, literal, where, col } = require("sequelize");
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
        status_id: 1,
      },
      order: [["id", "ASC"]],
      offset: page * size,
      limit: size,
      include: [
        {
          model: User,
          as: "member",
          attributes: ["id", "username"],
        },
        {
          model: Book,
          as: "book",
          attributes: ["id", "title"],
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
          ],
        },
      ],
    });

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

// create rental
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
      attributes: ["title", "author", "isbn", "id"],
    });
    if (!book) {
      throw new CustomError("Kitob topilmadi bu id bilan!", 404);
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
        null,
        "create"
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
        null,
        "create"
      );
    }

    res.status(201).json({
      message: "Ijara yaratildi",
      rental: newRental,
    });
  } catch (error) {
    console.error("Failed to create new rental", error);
    next(error);
  }
};

//UPDATE RENTAL

exports.updateRental = async (req, res, next) => {
  const owner_id = req.user.id;
  const { user_id, book_id, rental_date, due_date, return_date } = req.body;
  const { rentalId } = req.params;

  try {
    //parse into jsDates
    const rentalDt = new Date(rental_date);
    const dueDt = new Date(due_date);
    const returnDate = new Date(return_date);

    const rentalData = await Rental.findOne({
      where: { id: rentalId },
    });
    if (!rentalData || rentalData.length === 0) {
      throw new CustomError("Bu id bilan ijara topilmadi", 404);
    }

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

    const updated = await Rental.update(
      {
        user_id: member.id,
        owner_id,
        book_id: book.id,
        rental_date,
        due_date,
        return_date,
      },
      {
        where: { id: rentalId },
      }
    );
    if (!updated || updated.length === 0) {
      throw new CustomError("Yangi ijara yaratilmadi.", 400);
    }

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
        null,
        "update"
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
        null,
        "update"
      );
    }

    res.status(201).json({
      message: "Ijara tharirlandi",
      rental: updated,
    });
  } catch (error) {
    console.error("Failed to update rental", error);
    next(error);
  }
};
//CANCEL THE RENTAL.

exports.updateRentalReturn = async (req, res, next) => {
  const owner_id = req.user.id;
  const { rental_id, book_id } = req.query;
  // console.log("rental data ", rental_id, book_id);

  try {
    const rentalData = await Rental.findOne({
      where: { id: rental_id },
    });
    if (!rentalData || rentalData.length === 0) {
      throw new CustomError("Bu id bilan ijara topilmadi", 404);
    }

    const library = await Library.findOne({ where: { owner_id } });
    if (!library) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu user uchun",
        404
      );
    }

    const book = await Book.findOne({
      where: { id: book_id },
    });
    if (!book || book.length === 0) {
      throw new CustomError("Bu id bilan kitob topilmadi!", 404);
    }

    const member = await User.findOne({
      where: { id: rentalData.user_id },
    });
    if (!member || member.length === 0) {
      throw new CustomError("foydalanuvchi topilmadi bu id bilan!");
    }

    const [affectedCount, updatedRows] = await Rental.update(
      {
        actual_return_date: literal("CURRENT_DATE"),
        // or: literal("CURRENT_DATE")
        status_id: 2,
      },
      {
        where: {
          id: rental_id,
          owner_id,
        },
        returning: true, // <-- tells Postgres to RETURN the updated rows
        plain: false,
      }
    );

    if (affectedCount === 0) {
      throw new CustomError("Ijara qaytarib berilishi tugallanmadi. ", 400);
    }

    // first bump the counter
    await Book.increment("read_count", {
      by: 1,
      where: { id: book_id },
    });

    // change book status 'mavjud'
    await Book.update({ status_id: 1 }, { where: { id: book_id } });

    //create new data for member who has read the book
    await ReadBooks.create({
      user_id: member.id,
      book_id: book.id,
      returned_on: literal("CURRENT_DATE"),
    });
    //NOTIFICATIONS HERE
    const ownerTgData = await User.findOne({
      where: { id: owner_id },
      attributes: ["id", "fullname", "telegram_chat_id"],
    });

    const updatedRental = updatedRows[0];

    // notify member
    if (member.telegram_chat_id) {
      await notifyMember(
        member.telegram_chat_id,
        book.title,
        library.name,
        fmt(updatedRental.rental_date),
        fmt(updatedRental.due_date),
        fmt(updatedRental.return_date),
        fmt(updatedRental.actual_return_date),
        "cancel"
      );
    }

    // notify the owner
    if (ownerTgData.telegram_chat_id) {
      await notifyOwner(
        ownerTgData.telegram_chat_id,
        member.fullname,
        book.title,
        fmt(updatedRental.rental_date),
        fmt(updatedRental.due_date),
        fmt(updatedRental.return_date),
        fmt(updatedRental.actual_return_date),
        "cancel"
      );
    }

    res.status(200).json({
      message: "Rental marked returned",
      rental: updatedRental,
    });
  } catch (error) {
    console.error("Failed to update rentals actual return date.", error);
    next(error);
  }
};

// FETCHING OVER DUE RENTALS
exports.fetchOverDueRentals = async (req, res, next) => {
  const owner_id = req.user.id;
  const page = req.query.page || 0;
  const size = req.query.size || 50;

  try {
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
        actual_return_date: null,
        return_date: { [Op.lt]: fn("NOW") },
        status_id: 3,
      },
      include: [
        { model: Book, as: "book" },
        {
          model: User,
          as: "member",
          attributes: ["username", "fullname", "phonenumber"],
        },
        { model: RentalStatus, as: "status" },
      ],
      order: [["return_date", "ASC"]],
      offset: page * size,
      limit: size,
    });

    if (!rows || rows.length === 0) {
      throw new CustomError("Sizda kechikkan ijaralar mavjud emas.", 404);
    }

    res.status(200).json({
      overDueRentals: rows,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch overdue rentals ", error);
    next(error);
  }
};

exports.fetchRentalById = async (req, res, next) => {
  const owner_id = req.user.id;
  const { rental_id } = req.params;

  try {
    const library = await Library.findOne({ where: { owner_id } });
    if (!library) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu user uchun",
        404
      );
    }

    const rental = await Rental.findOne({
      where: {
        id: rental_id,
      },

      include: [
        {
          model: User,
          as: "member",
          attributes: ["id", "username"],
        },
        {
          model: Book,
          as: "book",
          attributes: ["id", "title"],
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
          ],
        },
      ],
    });

    if (!rental) {
      throw new CustomError("Bu id bilan ijara topilmadi ", 404);
    }

    res.status(200).json({
      rental,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to rental data by id ", error);
    next(error);
  }
};
