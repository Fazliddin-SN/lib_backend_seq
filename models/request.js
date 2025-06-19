"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Request.init(
    {
      user_email: DataTypes.STRING,
      owner_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      book_id: {
        type: DataTypes.STRING,
        references: {
          model: "Book",
          key: "book_id",
        },
      },
      message: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Request",
    }
  );
  return Request;
};
