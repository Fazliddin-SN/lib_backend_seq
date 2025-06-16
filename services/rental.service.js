const {
  Library,
  User,
  Book,
  LibraryMember,
  Category,
  Rental,
} = require("../models");
const { Op, literal } = require("sequelize");
const { bot } = require("../utils/bot");

// Format dates as YYYY-MM_DD
const fmt = (d) =>
  d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tashkent",
  });

exports.fetchDueToday = async (req, res, next) => {
  const rentals = await Rental.findAll({
    where: {
      actual_return_date: null,
      return_date: { [Op.eq]: literal("CURRENT_DATE") },
    },
    include: [
      {
        model: Book,
        as: "book",
        attributes: ["id", "title", "author"],
        include: [
          {
            model: Library,
            as: "library",
            attributes: ["id", "name"],
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "fullname", "username", "telegram_chat_id"],
              },
            ],
          },
        ],
      },
      {
        model: User,
        as: "member",
        attributes: ["id", "fullname", "username", "telegram_chat_id"],
      },
    ],
  });
  // console.log("rentals ", rentals);

  return rentals;
};

exports.datysLeft = async () => {
  // inside your async function…
  const todayDateStr = new Date().toISOString().split("T")[0];

  const rentals = await Rental.findAll({
    where: {
      actual_return_date: null,
    },
    include: [
      {
        model: Book,
        as: "book",
        attributes: ["id", "title", "author"],
        include: [
          {
            model: Library,
            as: "library",
            attributes: ["id", "name"],
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "fullname", "username", "telegram_chat_id"],
              },
            ],
          },
        ],
      },
      {
        model: User,
        as: "member",
        attributes: ["id", "fullname", "username", "telegram_chat_id"],
      },
    ],
  });
  // console.log("rentals  days left", rentals);

  for (const r of rentals) {
    // console.log("owner chat id", r.book.library.owner.telegram_chat_id);

    const today = new Date();
    const due = new Date(r.due_date);
    const expRet = new Date(r.return_date);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((expRet - today) / msPerDay);

    if (daysLeft > 0) {
      // Member reminder
      if (r.member.telegram_chat_id) {
        const text = `
<b>⏰ Eslatma!</b>
📚 <b>Kitob:</b> «${r.book.title}»
📅 <b>Ijara sanasi:</b> ${fmt(r.rental_date)}
⏳ <b>Qolgan muddat:</b> ${daysLeft} kun
🏛️ <b>Kutubxona:</b> «${r.book.library.name}»

<i>Iltimos, muddatni nazorat qilib, kitobni o‘z vaqtida qaytarishni unutmang.</i>
  `;
        await bot.api.sendMessage(r.member.telegram_chat_id, text, {
          parse_mode: "HTML",
        });
      }

      // Owner reminder
      if (r.book.library.owner.telegram_chat_id) {
        const ownerMsg = `
<b>🚨 Eslatma!</b>
👤 <b>Foydalanuvchi:</b> ${r.member.fullname}
📚 <b>Kitob:</b> «${r.book.title}»
⏳ <b>Qolgan muddat:</b> ${daysLeft} kun

<i>Kitobni muddatida qabul qilib olishingizni unutmang.</i>
  `;
        await bot.api.sendMessage(
          r.book.library.owner.telegram_chat_id,
          ownerMsg,
          { parse_mode: "HTML" }
        );
      }
    }
  }
};
