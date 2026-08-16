const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace(
  "return users.filter(u => u && u.UserID); // Filter out deleted empty rows",
  "return users.filter(u => u && u.UserID).map(u => {\n    if (String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';\n    return u;\n  });"
);

fs.writeFileSync('server/db.ts', code);
