const { CustomError } = require("../utils/customError.js");
const { bot } = require("../utils/bot.js");
const { fetchDueToday } = require("../services/rental.service.js");

// Format dates as YYYY-MM_DD
const fmt = (d) =>
  d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tashkent",
  });

// notifying the member
async function notifyMember(
  chatId,
  bookName,
  libraryName,
  rentalDate,
  dueDate,
  expectedReturnDate,
  actual_return_date,
  actionName
) {
  if (chatId) {
    if (
      actual_return_date !== null &&
      actual_return_date &&
      actionName === "cancel"
    ) {
      const text = `
            🎉 <b>Siz ijara olgan kitobni qaytarib berdingiz!!!</b>

            📖 <b>Kitob nomi:</b> «${bookName}»  
            🏛️ <b>Kutubxona:</b> «${libraryName}»  
            🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
            🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
            ⏳ <b>Qaytarilish sanasi:</b> ${actual_return_date}

            <i>Muvaffaqiyatli o‘qish tilaymiz!</i>
                    `;
      return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
    } else if (actionName === "update") {
      const textUpdate = `
         🎉 <b>"${bookName}" nomli kitob uchun ijara malumotlari tahrirlandi!</b>

         📖 <b>Kitob nomi:</b> «${bookName}»  
         🏛️ <b>Kutubxona:</b> «${libraryName}»  
         🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
         🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
         ⏳ <b>Qaytarilish sanasi:</b> ${expectedReturnDate}

            <i>Muvaffaqiyatli o‘qish tilaymiz!</i>
            `;
      return await bot.api.sendMessage(chatId, textUpdate, {
        parse_mode: "HTML",
      });
    } else if (actionName === "create") {
      const text = `
                🎉 <b>Siz kitob ijaraga oldingiz!</b>

                📖 <b>Kitob nomi:</b> «${bookName}»  
                🏛️ <b>Kutubxona:</b> «${libraryName}»  
                🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
                🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
                ⏳ <b>Qaytarilish sanasi:</b> ${expectedReturnDate}

                <i>Muvaffaqiyatli o‘qish tilaymiz!</i>
                `;

      return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
    }
  }

  return;
}

// when a new rental is made
async function notifyOwner(
  chatId,
  userName,
  bookName,
  rentalDate,
  dueDate,
  expectedReturnDate,
  actual_return_date,
  actionName
) {
  if (chatId) {
    /////
    if (
      actual_return_date !== null &&
      actual_return_date &&
      actionName === "cancel"
    ) {
      const textCancel = `
       
    📚 * ijara olingan kitob qaytarib berildi!*
       
    👤 *Foydalanuvchi:* ${userName}
    📖 *Kitob:*        ${bookName}
    📅 *Ijara Sanasi*:        ${rentalDate}
    🔔 *Eslatma Sanasi:*      ${dueDate}
    ⏳ *Qaytarilish Sanasi:*    ${actual_return_date}
            `;

      return await bot.api.sendMessage(chatId, textCancel, {
        parse_mode: "HTML",
      });
    }

    if (actionName === "update") {
      const textUpdate = `
      
        📚 *"${userName}" nomli foydalanuvchining ijara malumotlari tahrirlandi! *
     
        👤 *Foydalanuvchi:* _${userName}_
        📖 *Kitob:*        _${bookName}_
        📅 *Ijara*:        _${rentalDate}_
        🔔 *Eslatma:*      _${dueDate}_
        ⏳ *Qaytarish:*    _${expectedReturnDate}_
        `;

      return await bot.api.sendMessage(chatId, textUpdate, {
        parse_mode: "Markdown",
      });
    }

    if (actionName === "create") {
      const text = `
                    
            📚 *Yangi ijara*
                   
            👤 *Foydalanuvchi:* _${userName}_
            📖 *Kitob:*        _${bookName}_
            📅 *Ijara*:        _${rentalDate}_
            🔔 *Eslatma:*      _${dueDate}_
            ⏳ *Qaytarish:*    _${expectedReturnDate}_
               `;

      return await bot.api.sendMessage(chatId, text, {
        parse_mode: "Markdown",
      });
    }
  }
  return;
}

async function notifyDueToday() {
  const rentals = await fetchDueToday();
  for (let r of rentals) {
    // send message for member
    // Member reminder
    if (r.member.telegram_chat_id) {
      const borrowerMsg = `
🚨 <b>Eslatma!</b>

📚 <b>Kitob:</b> «${r.book.title}»
🏛️ <b>Kutubxona:</b> «${r.book.library.name}»
⏰ <b>Bugun qaytarish muddati tugadi!</b>
🗓️ <b>Ijara sanasi:</b> ${fmt(r.rental_date)}

🙏 <i>Iltimos, kitobni kechiktirmasdan qaytarib bering.</i>
  `;

      await bot.api.sendMessage(r.member.telegram_chat_id, borrowerMsg, {
        parse_mode: "HTML",
      });
    }

    // Owner reminder
    if (r.book.library.owner.telegram_chat_id) {
      const ownerMsg = `
📣 <b>Eslatma!</b>

👤 <b>Foydalanuvchi:</b> ${r.member.fullname}
📖 <b>Kitob:</b> «${r.book.title}»
⏰ <b>Bugun qaytarish vaqti!</b>
🗓️ <b>Ijara sanasi:</b> ${fmt(r.rental_date)}

🙏 <i>Kitobni muddatida qabul qilib olishingizni unutmang.</i>
  `;

      await bot.api.sendMessage(
        r.book.library.owner.telegram_chat_id,
        ownerMsg,
        { parse_mode: "HTML" }
      );
    }
  }
}

module.exports = {
  notifyMember,
  notifyOwner,
  notifyDueToday,
};
