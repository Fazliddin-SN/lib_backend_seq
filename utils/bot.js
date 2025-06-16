const { Bot, session } = require("grammy");
require("dotenv").config();

// initialize the new bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
// Apply middleware
bot.use(session({ initial: () => ({}) }));

module.exports = { bot };
