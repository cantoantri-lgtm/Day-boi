const bcrypt = require('bcryptjs');
const db = require('./server/db');

async function test() {
  const phone = '0903838892';
  const password = '123'; // or maybe 123456? The pattern is \d{6}, so probably 123456
  
  const user = await db.getUserByPhone(phone);
  console.log("User:", user);
  if (user) {
     const isMatch = await bcrypt.compare('123456', user.PasswordHash);
     console.log("Is Match (123456):", isMatch);
     const isMatch2 = await bcrypt.compare('123', user.PasswordHash);
     console.log("Is Match (123):", isMatch2);
  }
}
test().catch(console.error);
