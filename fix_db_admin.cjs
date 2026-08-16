const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

function enrichUserRole(userStr) {
    return userStr + "\n  if (u && String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';";
}

code = code.replace(
  "return users.find(u => normalize(u.PhoneNumber) === searchPhone) || null;",
  "const u = users.find(u => normalize(u.PhoneNumber) === searchPhone);\n  if (u && String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';\n  return u || null;"
);

code = code.replace(
  "return users.find(u => u.UserID === id) || null;",
  "const u = users.find(u => u.UserID === id);\n  if (u && String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';\n  return u || null;"
);

fs.writeFileSync('server/db.ts', code);
