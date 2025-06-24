"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tagging extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tagging.init(
    {
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tag", key: "id" },
      },
      taggable_type: { type: DataTypes.STRING, allowNull: false },

      taggable_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Tagging",
    }
  );
  return Tagging;
};
