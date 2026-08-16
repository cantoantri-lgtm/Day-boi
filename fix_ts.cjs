const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

code = code.replace(
  'const [dayOfWeek, time] = Object.entries(DayTimes)[0] || [editingSchedule.DayOfWeek, {start: editingSchedule.StartTime, end: editingSchedule.EndTime}];',
  'const [dayOfWeek, time] = (Object.entries(DayTimes)[0] as [string, {start: string, end: string}]) || [editingSchedule.DayOfWeek, {start: editingSchedule.StartTime, end: editingSchedule.EndTime}];'
);

code = code.replace(
  'for (const [day, time] of Object.entries(DayTimes)) {',
  'for (const [day, time] of Object.entries(DayTimes) as [string, {start: string, end: string}][]) {'
);

fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
console.log('Fixed TS');
