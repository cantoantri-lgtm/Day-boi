const db = require('./server/db');
async function test() {
  const users = await db.getUsers();
  const students = users.filter(u => u.Role.includes('Student'));
  console.log("Students:", students);
  const regs = await db.getRegistrations();
  console.log("Registrations:", regs);
}
test();
