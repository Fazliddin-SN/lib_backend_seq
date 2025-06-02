"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Rental.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      book_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Books",
          key: "book_id",
        },
      },
      owner_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      rental_date: DataTypes.DATE,
      due_date: DataTypes.DATE,
      return_date: DataTypes.DATE,
      actual_return_date: DataTypes.DATE,
      status_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "RentalStatuses",
          key: "rental_status_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Rental",
    }
  );
  return Rental;
};
