const { CustomError } = require("../utils/customError.js");
const { bot } = require("../utils/bot.js");

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
  actual_return_date
) {
  if (chatId) {
    if (actual_return_date !== null && actual_return_date) {
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
    }
    const text = `
🎉 <b>Siz kitob ijaraga oldingiz!</b>

📖 <b>Kitob nomi:</b> «${bookName}»  
🏛️ <b>Kutubxona:</b> «${libraryName}»  
🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
⏳ <b>Qaytarilish sanasi:</b> ${expectedReturnDate}

<i>Muvaffaqiyatli o‘qish tilaymiz!</i>
`;
    await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
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
  actual_return_date
) {
  if (chatId) {
    /////
    if (actual_return_date !== null && actual_return_date) {
      const text = `
━━━━━━━━━━━━━━━
📚 * ijara olingan kitob qaytarib berildi!*
━━━━━━━━━━━━━━━

👤 *Foydalanuvchi:* _${userName}_
📖 *Kitob:*        _${bookName}_
📅 *Ijara Sanasi*:        _${rentalDate}_
🔔 *Eslatma Sanasi:*      _${dueDate}_
⏳ *Qaytarilish Sanasi:*    _${actual_return_date}_
`;

      return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
    }

    const text = `
━━━━━━━━━━━━━━━
📚 *Yangi ijara*
━━━━━━━━━━━━━━━

👤 *Foydalanuvchi:* _${userName}_
📖 *Kitob:*        _${bookName}_
📅 *Ijara*:        _${rentalDate}_
🔔 *Eslatma:*      _${dueDate}_
⏳ *Qaytarish:*    _${expectedReturnDate}_
`;

    return await bot.api.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }
  console.log("dadada");

  return;
}

// this notifies the members about how many days left to return a book
async function notifyMemForBookReturn(
  chatId,
  bookName,
  rentalDate,
  libname,
  daysleft,
  rentalDate
) {
  if (chatId) {
    // console.log("chat ids book name ", chatId, bookName, daysleft);

    const text = `
⏰ <b>Eslatma!</b>

📚 <b>Kitob nomi:</b> «${bookName}»  
📅 <b>Ijara boshlangan sana:</b> ${fmt(rentalDate)}  
⏳ <b>Qaytarishga qolgan muddat:</b> ${daysleft} kun  
🏛️ <b>Kutubxona:</b> «${libname}»

<i>Iltimos, kitobni belgilangan muddatda qaytarishni unutmang!</i>
`;

    if (daysleft === 0) {
      const rentedOn = rentalDate.toISOString().split("T")[0];
      const borrowerMsg = `
🚨 <b>Eslatma!</b>

📚 <b>Kitob:</b> «${bookName}»  
🏛️ <b>Kutubxona:</b> «${libname}»

⏰ <b>Bugun qaytarish muddati tugadi!</b>  
🗓️ <b>Ijara boshlangan sana:</b> ${fmt(rentedOn)}

🙏 <i>Iltimos, kitobni kechiktirmasdan qaytarib bering.</i>
`;

      return await bot.api.sendMessage(chatId, borrowerMsg, {
        parse_mode: "HTML",
      });
    }
    return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  }
  return;
}

/// notify owner about book return actions
async function notifyOwnerForBookReturn(
  chatId,
  bookName,
  user_name,
  daysLeft,
  rentalDate
) {
  if (chatId) {
    if (daysLeft === 0) {
      const rentedOn = rentalDate.toISOString().split("T")[0];
      const ownerMsg = `
📣 <b>Eslatma!</b>

👤 <b>Foydalanuvchi:</b> ${row.username}  
📖 <b>Kitob:</b> «${row.title}»  
⏰ <b>Bugun qaytarish vaqti!</b>  
🗓️ <b>Ijara sanasi:</b> ${fmt(rentedOn)}

🙏 <i>Iltimos, kitobni qabul qilib olishingizni unutmang.</i>
`;

      return await bot.api.sendMessage(chatId, ownerMsg, {
        parse_mode: "HTML",
      });
    }
    const ownerMsg = `
🚨 <b>Eslatma!</b>

👤 <b>Foydalanuvchi:</b> ${user_name}  
📚 <b>Kitob nomi:</b> «${bookName}»  
⏳ <b>Qaytarishga qolgan muddat:</b> ${daysLeft} kun  

🙏 <i>Iltimos, muddatni nazorat qilib, kitobni o‘z vaqtida qabul qilishingizni unutmang.</i>
`;
    return await bot.api.sendMessage(chatId, ownerMsg, { parse_mode: "HTML" });
  }
  return;
}

// notify when any book is marked as returned
async function notif() {}
module.exports = {
  notifyMember,
  notifyOwner,
  notifyMemForBookReturn,
  notifyOwnerForBookReturn,
};
