"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Categories", [
      { name: "Fantastika", createdAt: new Date(), updatedAt: new Date() },
      {
        name: "Ilmiy-Fantastika",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { name: "Sarguzasht", createdAt: new Date(), updatedAt: new Date() },
      { name: "Tarixiy", createdAt: new Date(), updatedAt: new Date() },
      { name: "Triller", createdAt: new Date(), updatedAt: new Date() },
      { name: "Detektive", createdAt: new Date(), updatedAt: new Date() },
      { name: "Romantika", createdAt: new Date(), updatedAt: new Date() },
      { name: "Dramatik", createdAt: new Date(), updatedAt: new Date() },
      { name: "Tarix", createdAt: new Date(), updatedAt: new Date() },
      { name: "Psixologiya", createdAt: new Date(), updatedAt: new Date() },
      {
        name: "Iqtisodiy va Biznes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sogliq va Tibbiyot",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Komputer va Dasturlash",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Matematika va Fizika",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Biografiya va Xotiralar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Oz-O'zini Rivojlantirish",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sayohat va Turizm",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diniy va Marifiy",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Categories", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
