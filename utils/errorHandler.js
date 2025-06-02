const { ValidationError, UniqueConstraintError } = require("sequelize");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorMessage =
    err.message ||
    "Ichki server xatosi. Iltimos keyinroq qayta urinib ko‘ring.";

  // ✅ Sequelize-specific error handling
  if (err instanceof UniqueConstraintError) {
    const field = err.errors?.[0]?.path;
    const value = err.errors?.[0]?.value;

    errorMessage = `“${field}” qiymati (${value}) allaqachon mavjud. Iltimos, boshqa qiymat kiriting.`;
    statusCode = 400;
  }

  if (err instanceof ValidationError) {
    errorMessage = err.errors.map((e) => e.message).join(", ");
    statusCode = 400;
  }

  // ✅ PostgreSQL error codes
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        errorMessage =
          "Kiritilgan ma’lumot allaqachon mavjud. Iltimos, boshqa qiymat kiriting.";
        statusCode = 400;
        break;
      case "23503": // Foreign key violation
        errorMessage =
          "Bog‘liq ma’lumot topilmadi. Iltimos, to‘g‘ri ma’lumot kiriting.";
        statusCode = 400;
        break;
      case "23502": // Not null violation
        errorMessage = "Majburiy maydon bo‘sh bo‘lishi mumkin emas.";
        statusCode = 400;
        break;
      case "23514": // Check constraint violation
        errorMessage =
          "Kiritilgan ma’lumot talab qilingan shartlarga mos kelmaydi.";
        statusCode = 400;
        break;
      case "22001": // Data too long for field
        errorMessage =
          "Kiritilgan ma’lumot ruxsat etilgan o‘lchamdan oshib ketdi.";
        statusCode = 400;
        break;
      case "42601": // SQL syntax error
        errorMessage =
          "So‘rov bajarishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.";
        statusCode = 500;
        break;
      default:
        break;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
};

module.exports = errorHandler;
