const { Op } = require("sequelize");
const { Rental, Review } = require("../models");

//ensure user finished reading
exports.ensureHasRead = async (req, res, next) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;

  const rental = await Rental.findOne({
    where: {
      user_id: userId,
      book_id: bookId,
      actual_return_date: { [Op.lte]: new Date() },
    },
  });
  if (!rental) {
    return res
      .status(403)
      .json({ error: "You must finish reading before reviewing." });
  }
  next();
};

//allow only author or admin
exports.canEditReview = async (req, res, next) => {
  const user = req.user;

  const review = await Review.findByPk(req.params.id);

  if (!review) return res.status(404).json({ error: "Review not found." });

  if (review.user_id === user.id) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
};
