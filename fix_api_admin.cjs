const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');

code = code.replace("let effectiveRole = user.Role; if (user.Admin === 'TRUE' && !effectiveRole.includes('Admin')) effectiveRole += ', Admin';", "let effectiveRole = user.Role;");
fs.writeFileSync('server/api.ts', code);
console.log('Fixed api.ts');
