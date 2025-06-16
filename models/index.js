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
db.BookStatus.hasMany(db.Book, { foreignKey: "id", as: "books" });
db.Book.belongsTo(db.BookStatus, {
  foreignKey: "id",
  as: "status",
});

// Define associations here
db.User.belongsTo(db.UserRoles, {
  foreignKey: "role_id",
  as: "role",
});
db.UserRoles.hasMany(db.User, { foreignKey: "role_id", as: "users" });

// Each library belongs to one user (owner)
db.Library.belongsTo(db.User, {
  foreignKey: "owner_id", // make sure this matches your DB column
  as: "owner",
});

// Each library belongs to one user (owner)
db.Book.belongsTo(db.Library, {
  foreignKey: "library_id", // make sure this matches your DB column
  as: "library",
});

// One user can have many libraries
db.User.hasMany(db.Library, {
  foreignKey: "owner_id",
  as: "library",
});

db.LibraryMember.belongsTo(db.User, {
  foreignKey: "user_id",
  as: "users", // 👈 this is important
});

db.User.hasMany(db.LibraryMember, {
  foreignKey: "user_id",
  as: "members", // optional alias
});

db.Book.belongsTo(db.Category, {
  foreignKey: "id",
  as: "category",
});
db.Category.hasMany(db.Book, { foreignKey: "id", as: "books" });

db.Rental.belongsTo(db.RentalStatus, {
  foreignKey: "id",
  as: "rental_status",
});

db.Rental.belongsTo(db.User, {
  foreignKey: "user_id",
  as: "member",
});
db.Rental.belongsTo(db.Book, { foreignKey: "book_id", as: "book" });

db.RentalStatus.hasMany(db.Rental, {
  foreignKey: "id",
  as: "rentals",
});

///
db.LibraryMember.belongsTo(db.Library, {
  foreignKey: "library_id",
  as: "library",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
