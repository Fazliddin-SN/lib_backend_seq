"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Review.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: { model: "User", key: "id" },
      },
      book_id: {
        type: DataTypes.INTEGER,
        references: { model: "Book", key: "id" },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      title: DataTypes.STRING,
      content: { type: DataTypes.TEXT, allowNull: false },
      version: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      version: true,
      underscored: true,
    }
  );
  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: "user_id" });
    Review.belongsTo(models.Book, { foreignKey: "book_id" });
    Review.belongsToMany(models.Tag, {
      through: models.Tagging,
      foreignKey: "taggable_id",
      constraints: false,
      scope: { taggable_type: "Review" },
    });
    Review.hasMany(models.Upvote, {
      foreignKey: "target_id",
      scope: { target_type: "Review" },
    });
  };
  return Review;
};
