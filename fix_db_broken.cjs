const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace("//(scheduleId: string, data: Partial<Schedule>) {", "export async function updateSchedule(scheduleId: string, data: Partial<Schedule>) {");

fs.writeFileSync('server/db.ts', code);
