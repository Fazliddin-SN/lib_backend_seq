"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      rental_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Rentals",
          key: "rental_id",
        },
      },
      type: DataTypes.TEXT,
      message: DataTypes.TEXT,
      is_read: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
