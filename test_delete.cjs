const db = require('./server/db');

async function test() {
  const users = await db.getAllUsers();
  const user = users.find(u => u.FullName === 'Nguyễn Văn D');
  if (!user) {
     console.log("No user found");
     return;
  }
  console.log("Found user:", user);
  try {
     await db.deleteUser(user.UserID);
     console.log("Deleted");
  } catch (e) {
     console.log("Error:", e);
  }
}
test();
