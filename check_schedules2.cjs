const db = require('./server/db');
async function test() {
  const schedules = await db.getSchedules();
  console.log("Total schedules:", schedules.length);
  console.log(schedules.slice(0, 3));
}
test();
