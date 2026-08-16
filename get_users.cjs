const db = require('./server/db');
async function test() {
  const users = await db.getAllUsers();
  console.log(users);
}
test();
