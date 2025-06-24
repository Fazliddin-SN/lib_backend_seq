const { CustomError } = require("../utils/customError");
const {
  Library,
  User,
  Book,
  LibraryMember,
  Category,
  Rental,
  Review,
} = require("../models");

// GET all reviews for a book
// GET /books/:bookId/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { book_id: req.params.bookId },
      include: [
        { model: User, attributes: ["id", "fullname"], as: "author" },
        {
          model: Book,
          attributes: ["id", "title"],
          include: [
            { model: Library, attributes: ["id", "name"], as: "library" },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(reviews);
  } catch (error) {
    console.error("Failed to fetch all reviews ", error);
    next(error);
  }
};

// GET current user's reviews
// GET /users/:userId/reviews

exports.fetchCurrentUserReviews = async (req, res, next) => {
  const { id, role_id } = req.user;

  try {
    const reviews = await Review.findAll({
      where: { user_id: id },
      include: [
        {
          model: Book,
          attributes: ["id", "title"],
          include: [
            { model: Library, as: "library", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    console.error("Failed to fetch current user's all reviews ", err);
    next(err);
  }
};

// CREATE a new review
// POST /books/:bookId/reviews
exports.createReview = async (req, res, next) => {
  const { rating, title, content } = req.body;
  try {
    const review = await Review.create({
      user_id: req.user.id,
      book_id: req.params.bookId,
      rating,
      title,
      content,
    });
    if (!review) {
      throw new CustomError("WTaqriz yaratilmadi", 400);
    }
    res.status(201).json({
      review,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to create a new review", error);
    next(error);
  }
};

// UPDATE a review
// PATCH /reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const updates = (({ rating, title, content }) => ({
      rating,
      title,
      content,
    }))(req.body);

    const [count, updatedRows] = await Review.update(updates, {
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!count) throw new CustomError("Bu id bilan taqriz tahrirlanmadi", 400);

    res.json({
      updatedRows,
      message: "Taqriz tahrirlandi.",
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to edit a review", error);
    next(error);
  }
};

// DELETE /reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const deleted = await Review.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!deleted) throw new CustomError("Taqriz o'chirilmadi", 400);

    res.status(200).json({
      message: "Taqriz o'chirildi",
    });
  } catch (error) {
    console.error("Failed to delete a review", error);
    next(error);
  }
};
