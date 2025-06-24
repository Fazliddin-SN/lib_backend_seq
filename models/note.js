"use strict";
const { Model } = require("sequelize");
const { User } = require("../models");
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Note.init(
    {
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: "User", key: "id" },
      },
      book_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: "Book", key: "id" },
      },
      content: { type: DataTypes.TEXT, allowNull: false },
      is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
      version: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Note",
    }
  );
  return Note;
};
