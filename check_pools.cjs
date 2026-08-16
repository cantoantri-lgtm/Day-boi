const db = require('./server/db');
async function test() {
  const pools = await db.getPools();
  console.log(pools);
}
test();
