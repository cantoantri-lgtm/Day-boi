const db = require('./server/db');
async function test() {
  const schedules = await db.getAllSchedules();
  console.log(schedules);
}
test();
