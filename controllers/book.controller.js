const { CustomError } = require("../utils/customError");

const fs = require("fs-extra");
const path = require("path");

const { Book, BookStatus, Category, Library } = require("../models");
const { Op } = require("sequelize");

exports.bookController = {
  // GET BOOKS FOR LIBRARY
  async getBooksByLib(req, res, next) {
    const owner_id = req.user.id;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 50;

    const { category_id, bookTitle, isbn, status_id } = req.query;
    // console.log("category id ", category_id);

    try {
      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError(
          "Hech qanday kutubxona topilmadi bu user uchun",
          404
        );
      }
      // Build the where clause based on query parameters
      const whereClause = {};

      if (category_id) {
        whereClause.category_id = category_id;
      }

      if (bookTitle) {
        whereClause.title = {
          [Op.iLike]: `%${bookTitle}%`, // This allows partial matching
        };
      }

      if (isbn) {
        whereClause.isbn = {
          [Op.iLike]: `%${isbn}%`,
        };
      }

      if (status_id) {
        whereClause.status_id = status_id;
      }

      const { count, rows } = await Book.findAndCountAll({
        where: whereClause,
        order: [["id", "ASC"]],
        offset: page * size,
        limit: size,
        include: [
          { model: Category, as: "category" },
          { model: BookStatus, as: "status" },
        ],
      });

      // inside an async handler
      const promises = rows.map(async (r) => {
        if (!r.image_path) {
          r.setDataValue("imageData", null);
          return;
        }
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "book-images",
          `book-${r.id}.jpg`
        );
        try {
          const buf = await fs.promises.readFile(filePath);

          const base64 = buf.toString("base64");

          const mime = "image/jpeg"; // or detect by extension

          r.setDataValue("imageData", `data:${mime};base64,${base64}`);
        } catch {
          r.setDataValue("imageData", null);
        }
      });

      await Promise.all(promises);

      res.status(200).json({
        books: rows,
        totalItems: count,
        totalPages: Math.ceil(count / size),
        currentPage: page,
        status: "ok",
      });
    } catch (error) {
      console.error("Failed to get books for library", 400);
      next(error);
    }
  },

  // ADDING NEW BOOK
  async addBook(req, res, next) {
    const owner_id = req.user.id;
    try {
      const body = req.body;
      const file = req.file; // multer adds this

      const category = await Category.findOne({
        where: { id: body.category_id },
      });
      if (!category) {
        throw new CustomError("Bu type dagi kategoriya topilmadi!", 404);
      }

      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError(
          "Hech qanday kutubxona topilmadi bu user uchun",
          404
        );
      }

      const newBook = await Book.create({
        ...body,
        category_id: category.id,
        library_id: library.id,
      });

      if (!newBook) {
        throw new CustomError("Kitob qo'shilmadi.", 400);
      }

      if (file) {
        const oldPath = file.path;

        const ext = path.extname(file.originalname);
        const newFileName = `book-${newBook.id}${ext}`;
        const newPath = path.join("uploads", "book-images", newFileName);

        await fs.move(oldPath, newPath); // fs-extra move handles file existence better

        await newBook.update({ image_path: newPath });
      }

      res.status(201).json({
        message: "Kitob qo'shildi.",
        book: newBook,
      });
    } catch (error) {
      console.error("Failed to add a new book ", error);
      next(error);
    }
  },

  //UPDATE BOOK BY ID
  async updateBook(req, res, next) {
    const owner_id = req.user.id;
    const { id } = req.params;

    try {
      const body = req.body;
      const file = req.file;

      //existing book
      const book = await Book.findOne({
        where: { id },
      });
      if (!book) {
        throw new CustomError("Kitob topilmadi!", 404);
      }

      const category = await Category.findOne({
        where: { id: body.category_id },
      });
      if (!category) {
        throw new CustomError("Bu type dagi kategoriya topilmadi!", 404);
      }

      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError(
          "Hech qanday kutubxona topilmadi bu user uchun",
          404
        );
      }

      const updatedData = { ...body };
      const oldImage = book.image_path || null;

      if (file) {
        // removing the old image
        if (oldImage && fs.existsSync(oldImage)) {
          await fs.remove(oldImage);
        }
        const oldPath = file.path;

        const ext = path.extname(file.originalname);
        const newFileName = `book-${book.id}${ext}`;
        const newPath = path.join("uploads", "book-images", newFileName);

        await fs.move(oldPath, newPath, { overwrite: true }); // fs-extra move handles file existence better
        updatedData.image_path = newPath;
      }
      const result = await Book.update(updatedData, { where: { id } });
      if (!result) {
        throw new CustomError("Kitob tahrirlanmadi.", 400);
      }

      res.status(200).json({
        message: "Kitob tahrirlandi",
      });
    } catch (error) {
      console.error("Failed to update the book ", error);
      next(error);
    }
  },

  // DELETING THE BOOK
  async deleteBook(req, res, next) {
    const owner_id = req.user.id;
    const { id } = req.params;

    try {
      //existing book
      const book = await Book.findOne({
        where: { id },
      });
      if (!book) {
        throw new CustomError("Kitob topilmadi!", 404);
      }

      const library = await Library.findOne({ where: { owner_id } });
      if (!library) {
        throw new CustomError(
          "Hech qanday kutubxona topilmadi bu user uchun",
          404
        );
      }

      const oldImage = book.image_path || null;
      if (oldImage) {
        await fs.remove(oldImage);
      }

      await Book.destroy({ where: { id } });

      res.status(200).json({
        message: "Kitob o'chirildi",
      });
    } catch (error) {
      console.error("Failed to delete book ", error);
      next(error);
    }
  },

  //GET BOOK BY ID
  // GET BOOK BY ID
  async getBookById(req, res, next) {
    const ownerId = req.user.id;
    const { id } = req.params;
    console.log("book id ", id);

    try {
      const library = await Library.findOne({ where: { owner_id: ownerId } });
      if (!library) throw new CustomError("Kutubxona topilmadi", 404);

      const book = await Book.findOne({
        where: { id, library_id: library.id },
        include: [
          { model: Category, as: "category" },
          { model: BookStatus, as: "status" },
        ],
      });

      if (!book) throw new CustomError("Kitob topilmadi!", 404);

      // Build data URI only if an image_path exists
      let imageData = null;
      if (book.image_path) {
        const ext = path.extname(book.image_path);
        const filename = `book-${id}${ext}`;
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "book-images",
          filename
        );

        try {
          const buf = await fs.promises.readFile(filePath);
          const base64 = buf.toString("base64");
          const mimeType = `image/${ext.slice(1)}`;
          imageData = `data:${mimeType};base64,${base64}`;
        } catch (e) {
          console.warn(`Failed to load image for book ${id}:`, e);
          imageData = null;
        }
      }

      book.setDataValue("imageData", imageData);

      res.status(200).json({ book, status: "ok" });
    } catch (err) {
      console.error("Failed to fetch book by id:", err);
      next(err);
    }
  },
};
