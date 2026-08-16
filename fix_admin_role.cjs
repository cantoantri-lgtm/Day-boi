const fs = require('fs');

// 1. Update server/db.ts
let dbCode = fs.readFileSync('server/db.ts', 'utf8');
dbCode = dbCode.replace("Role: string;", "Role: string;\n  Admin?: string;");
fs.writeFileSync('server/db.ts', dbCode);

// 2. Update server/api.ts
let apiCode = fs.readFileSync('server/api.ts', 'utf8');
apiCode = apiCode.replace(/const token = jwt\.sign\(\{ UserID: user\.UserID, Role: user\.Role, FullName: user\.FullName \}/, 
"let effectiveRole = user.Role; if (user.Admin === 'TRUE' && !effectiveRole.includes('Admin')) effectiveRole += ', Admin';\n    const token = jwt.sign({ UserID: user.UserID, Role: effectiveRole, FullName: user.FullName }");
apiCode = apiCode.replace(/res\.json\(\{ token, user: \{ UserID: user\.UserID, Role: user\.Role/, 
"res.json({ token, user: { UserID: user.UserID, Role: effectiveRole");
fs.writeFileSync('server/api.ts', apiCode);

console.log('Fixed admin role');
