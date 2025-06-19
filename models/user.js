"use strict";
const { Model } = require("sequelize");
const Library = require("./library");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      fullname: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      phonenumber: { type: DataTypes.STRING, allowNull: false, unique: true },
      role_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
      avatar: { type: DataTypes.STRING },
      telegram_chat_id: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
