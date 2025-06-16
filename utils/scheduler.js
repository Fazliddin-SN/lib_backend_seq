const cron = require("node-cron");

const { notifyDueToday } = require("../controllers/notifications.controller");
const { datysLeft } = require("../services/rental.service");

// cron.schedule(
//   `0 9 * * * `,
//   async () => {
//     console.log(
//       `[Scheduler] Running reminder task at ${new Date().toISOString()}`
//     );
//     // notifies both member and owner that return date is today
//     notifyDueToday();
//     datysLeft();
//   },
//   { timezone: "Asia/Tashkent" }
// );

cron.schedule(
  `*/5 * * * * `,
  async () => {
    console.log(
      `[Scheduler] Running reminder task at ${new Date().toISOString()}`
    );

    // notifies both member and owner that return date is today
    notifyDueToday();
    datysLeft();
  },
  { timezone: "Asia/Tashkent" }
);
