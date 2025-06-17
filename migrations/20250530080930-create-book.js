"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Books", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isbn: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
      publication_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_path: {
        type: Sequelize.STRING,
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "BookStatuses",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      library_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Libraries",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      read_count: Sequelize.INTEGER,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Books");
  },
};
