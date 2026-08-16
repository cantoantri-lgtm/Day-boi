const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

// Fix deleteUser
code = code.replace(
  "  // Apps Script fallback: Overwrite the row with empty strings\n  const emptyRow = Array(rows[0].length).fill('');\n  await updateRow(SHEETS.USERS, index + 1, emptyRow);",
  "  await deleteRow(SHEETS.USERS, index + 1);"
);

// Fix deletePool
code = code.replace(
  "  const emptyRow = Array(rows[0].length).fill('');\n  await updateRow(SHEETS.POOLS, index + 1, emptyRow);",
  "  await deleteRow(SHEETS.POOLS, index + 1);"
);

fs.writeFileSync('server/db.ts', code);
