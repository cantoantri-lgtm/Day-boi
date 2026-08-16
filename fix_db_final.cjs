const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

const badStart = code.indexOf('//(scheduleId: string) {');
const nextGood = code.indexOf('// Registrations');

if (badStart !== -1 && nextGood !== -1) {
  code = code.substring(0, badStart) + code.substring(nextGood);
  fs.writeFileSync('server/db.ts', code);
  console.log('Fixed garbage in db.ts');
}
