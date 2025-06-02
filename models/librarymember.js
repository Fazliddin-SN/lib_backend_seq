"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LibraryMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LibraryMember.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
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
      modelName: "LibraryMember",
    }
  );
  return LibraryMember;
};
