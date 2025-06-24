"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Taggings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tag_id: {
        type: Sequelize.INTEGER,
        references: { model: "Tags", key: "id" },
        onDelete: "CASCADE",
      },
      taggable_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      taggable_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
    await queryInterface.addIndex("Taggings", ["taggable_type", "taggable_id"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Taggings");
  },
};
