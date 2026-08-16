const fs = require('fs');
let content = fs.readFileSync('server/api.ts', 'utf8');
content = content.replace(
  "if (userRoles.includes('Student')) {",
  "if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(registrations); } else if (userRoles.includes('Student')) {"
);
fs.writeFileSync('server/api.ts', content);
