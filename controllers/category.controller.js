const { CustomError } = require("../utils/customError");
const { Category, BookStatus, RentalStatus } = require("../models");

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    if (!categories) {
      throw new CustomError("Kategoriyalar topilmadi.", 404);
    }

    res.status(200).json({
      categories,
      status: "ok",
    });
  } catch (error) {
    console.error("Faieled to fetch categories, ", error);
    next(error);
  }
};

exports.getBookStatuses = async (req, res, next) => {
  try {
    const statuses = await BookStatus.findAll();
    if (!statuses) {
      throw new CustomError("Kategoriyalar topilmadi.", 404);
    }

    res.status(200).json({
      bookStatuses: statuses,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch book statuses, ", error);
    next(error);
  }
};

exports.getRentalStatuses = async (req, res, next) => {
  try {
    const statuses = await RentalStatus.findAll();
    if (!statuses) {
      throw new CustomError("Kategoriyalar topilmadi.", 404);
    }

    res.status(200).json({
      rentalStatuses: statuses,
      status: "ok",
    });
  } catch (error) {
    console.error("Failed to fetch book statuses, ", error);
    next(error);
  }
};
