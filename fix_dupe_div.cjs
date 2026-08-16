const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');
code = code.replace('<div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8"><div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">', '<div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">');
fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
