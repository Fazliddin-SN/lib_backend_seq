require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  timezone: "+05:00",
  dialectOptions: { useUTC: false },
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
