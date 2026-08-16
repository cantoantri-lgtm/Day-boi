const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

// Fix deleteSchedule
const match = "  const emptyRow = Array(rows[0].length).fill('');\n  console.log('Delete updateRow args:', SHEETS.SCHEDULES, index + 1, emptyRow);\n  await updateRow(SHEETS.SCHEDULES, index + 1, emptyRow);\n  try {\n     console.log('DeleteRow args:', SHEETS.SCHEDULES, index + 1);\n     await deleteRow(SHEETS.SCHEDULES, index + 1);\n  } catch(e) {\n     console.log('DeleteRow error:', e);\n  }";

if (code.includes(match)) {
  code = code.replace(match, "  await deleteRow(SHEETS.SCHEDULES, index + 1);");
  fs.writeFileSync('server/db.ts', code);
  console.log('Fixed deleteSchedule');
} else {
  console.log('Could not find match for deleteSchedule');
}
