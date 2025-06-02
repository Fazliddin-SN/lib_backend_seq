"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Rentals", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      rental_date: {
        type: Sequelize.DATE,
      },
      due_date: {
        type: Sequelize.DATE,
      },
      return_date: {
        type: Sequelize.DATE,
      },
      actual_return_date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Rentals");
  },
};
