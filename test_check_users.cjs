const db = require('./server/db');

async function test() {
  const users = await db.getAllUsers();
  const user = users.find(u => u.FullName === 'Nguyễn Văn D');
  if (!user) {
     console.log("No user found");
  } else {
     console.log("User still exists:", user);
  }
}
test();
