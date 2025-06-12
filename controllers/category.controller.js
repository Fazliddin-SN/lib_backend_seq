const { CustomError } = require("../utils/customError");
const { Category } = require("../models");

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
