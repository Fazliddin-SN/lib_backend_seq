"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReadBooks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ReadBooks.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: { model: "User", key: "id" },
      },
      book_id: {
        type: DataTypes.INTEGER,
        references: { model: "Book", key: "id" },
      },
      returned_on: { type: DataTypes.DATE, allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },

    {
      sequelize,
      modelName: "ReadBooks",
      timestamps: false,
    }
  );
  return ReadBooks;
};
