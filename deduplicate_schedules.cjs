const db = require('./server/db');

async function deduplicate() {
  const schedules = await db.getSchedules();
  console.log("Total schedules before:", schedules.length);
  
  const uniqueSchedules = new Map();
  const schedulesToDelete = [];
  
  for (const schedule of schedules) {
    const key = schedule.PoolID + "-" + schedule.TeacherID + "-" + schedule.DayOfWeek + "-" + schedule.StartTime + "-" + schedule.EndTime;
    if (uniqueSchedules.has(key)) {
      schedulesToDelete.push(schedule.ScheduleID);
    } else {
      uniqueSchedules.set(key, schedule);
    }
  }
  
  console.log("Found", schedulesToDelete.length, "duplicate schedules to delete.");
  
  for (const id of schedulesToDelete) {
    await db.deleteSchedule(id);
  }
  
  console.log("Finished deleting duplicates.");
}

deduplicate().catch(console.error);
