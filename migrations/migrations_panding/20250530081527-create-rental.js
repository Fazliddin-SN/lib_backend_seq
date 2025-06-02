"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Rentals", {
      rental_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
