const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');

if (!code.includes('/debug-logs')) {
  code = code.replace("const router = express.Router();", "const router = express.Router();\n\nlet recentLogs = [];\nconst originalConsoleLog = console.log;\nconsole.log = function(...args) {\n  recentLogs.push(args.join(' '));\n  if (recentLogs.length > 100) recentLogs.shift();\n  originalConsoleLog.apply(console, args);\n};\n\nrouter.get('/debug-logs', (req, res) => { res.json({logs: recentLogs}); });\n");
  fs.writeFileSync('server/api.ts', code);
  console.log("Debug endpoint added");
}
