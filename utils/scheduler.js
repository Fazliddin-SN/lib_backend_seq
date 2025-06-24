const cron = require("node-cron");
const { Rental } = require("../models");
const { notifyDueToday } = require("../controllers/notifications.controller");
const { datysLeft } = require("../services/rental.service");
const { Op } = require("sequelize");

cron.schedule(
  `0 9 * * * `,
  async () => {
    console.log(
      `[Scheduler] Running reminder task at ${new Date().toISOString()}`
    );

    // check if there are overdue rentals
    await Rental.update(
      { status_id: 3 },
      {
        where: {
          return_date: { [Op.lt]: new Date() }, // due_date < now
          actual_return_date: null,
          status_id: { [Op.ne]: 3 }, // not already marked
        },
      }
    );

    // notifies both member and owner that return date is today
    notifyDueToday();
    datysLeft();
  },
  { timezone: "Asia/Tashkent" }
);

// cron.schedule(
//   `*/5 * * * * `,
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
