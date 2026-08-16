const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace(/export async function updateSchedule/, `export async function updateSchedule(scheduleId: string, data: Partial<Schedule>) {
  const rows = await getRows(SHEETS.SCHEDULES);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === scheduleId);
  console.log('UpdateSchedule:', { scheduleId, index, rowLength: rows.length });
  if (index === -1) throw new Error('Schedule not found');
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => {
    let val = updated[h] || '';
    if (h === 'StartTime' || h === 'EndTime') {
       if (typeof val === 'string' && !val.startsWith("'")) {
          val = "'" + val;
       }
    }
    return val;
  });
  console.log('UpdateRow args:', SHEETS.SCHEDULES, index + 1, newRow);
  await updateRow(SHEETS.SCHEDULES, index + 1, newRow);
  return updated;
}
//`);

code = code.replace(/export async function deleteSchedule/, `export async function deleteSchedule(scheduleId: string) {
  const rows = await getRows(SHEETS.SCHEDULES);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === scheduleId);
  console.log('DeleteSchedule:', { scheduleId, index, rowLength: rows.length });
  if (index === -1) throw new Error('Schedule not found');
  const emptyRow = Array(rows[0].length).fill('');
  console.log('Delete updateRow args:', SHEETS.SCHEDULES, index + 1, emptyRow);
  await updateRow(SHEETS.SCHEDULES, index + 1, emptyRow);
  try {
     console.log('DeleteRow args:', SHEETS.SCHEDULES, index + 1);
     await deleteRow(SHEETS.SCHEDULES, index + 1);
  } catch(e) {
     console.log('DeleteRow error:', e);
  }
  return { success: true };
}
//`);

fs.writeFileSync('server/db.ts', code);
