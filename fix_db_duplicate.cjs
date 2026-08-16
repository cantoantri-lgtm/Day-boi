const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

const firstStart = code.indexOf('export async function updateSchedule');
const secondStart = code.indexOf('export async function updateSchedule', firstStart + 1);

const deleteStart = code.indexOf('export async function deleteSchedule', secondStart);

if (secondStart !== -1 && deleteStart !== -1) {
  code = code.substring(0, secondStart) + code.substring(deleteStart);
  fs.writeFileSync('server/db.ts', code);
  console.log('Removed duplicate updateSchedule');
} else {
  console.log('Duplicate not found');
}
