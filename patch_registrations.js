const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');
code = code.replace(
  "router.post('/registrations', authenticate, requireRole(['Student']), async (req: any, res) => {",
  "router.post('/registrations', authenticate, async (req: any, res) => {"
);
code = code.replace(
  "StudentID: req.user.UserID,",
  "StudentID: req.body.StudentID || req.user.UserID,"
);
code = code.replace(
  "ApprovalStatus: 'Pending',",
  "ApprovalStatus: req.body.ApprovalStatus || 'Pending',"
);
fs.writeFileSync('server/api.ts', code);
