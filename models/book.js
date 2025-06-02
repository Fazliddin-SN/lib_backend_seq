"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      author: DataTypes.STRING,
      isbn: { type: DataTypes.INTEGER, allowNull: false },
      category_id: DataTypes.INTEGER,
      publication_date: DataTypes.DATE,
      image_path: DataTypes.STRING,
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BookStatuses",
          key: "book_status_id",
        },
      },
      library_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Libraries",
          key: "library_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
