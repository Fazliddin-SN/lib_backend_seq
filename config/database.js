const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection established!!!");
  } catch (error) {
    console.error("Connection error ", error);
  }
};

module.exports = connectDB;
