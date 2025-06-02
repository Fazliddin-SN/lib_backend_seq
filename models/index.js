"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Read all model files and initialize them
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Set up relationships here
db.BookStatus.hasMany(db.Book, { foreignKey: "book_status_id", as: "books" });
db.Book.belongsTo(db.BookStatus, {
  foreignKey: "book_status_id",
  as: "status",
});

// Define associations here
db.User.belongsTo(db.UserRoles, {
  foreignKey: "role_id",
  as: "users",
});
db.UserRoles.hasMany(db.User, { foreignKey: "category_id", as: "role" });

db.Book.belongsTo(db.Category, {
  foreignKey: "category_id",
  as: "category",
});
db.Category.hasMany(db.Book, { foreignKey: "category_id", as: "books" });

db.Rental.belongsTo(db.RentalStatus, {
  foreignKey: "rental_status_id",
  as: "rental_status",
});
db.RentalStatus.hasMany(db.Rental, {
  foreignKey: "rental_status_id",
  as: "rentals",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
