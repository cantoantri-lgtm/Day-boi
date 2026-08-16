const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');

// Fix /registrations route
code = code.replace(
  "    const registrations = await db.getRegistrations();\n    const userRoles = req.user.Role ? req.user.Role.split(',').map((r: string) => r.trim()) : [];\n    if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(payments); } else if (userRoles.includes('Student')) {\n      res.json(registrations.filter(r => r.StudentID === req.user.UserID));\n    } else {\n      res.json(payments);",
  "    const registrations = await db.getRegistrations();\n    const userRoles = req.user.Role ? req.user.Role.split(',').map((r: string) => r.trim()) : [];\n    if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(registrations); } else if (userRoles.includes('Student')) {\n      res.json(registrations.filter(r => r.StudentID === req.user.UserID));\n    } else {\n      res.json(registrations);"
);

// Fix /attendance route
code = code.replace(
  "} else if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(payments); } else if (userRoles.includes('Student')) {\n      res.json(allAtt.filter(a => a.StudentID === req.user.UserID));",
  "} else if (userRoles.includes('Admin')) { res.json(allAtt); } else if (userRoles.includes('Student')) {\n      res.json(allAtt.filter(a => a.StudentID === req.user.UserID));"
);

fs.writeFileSync('server/api.ts', code);
