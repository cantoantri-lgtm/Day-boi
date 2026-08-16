const fetch = require('node-fetch'); // wait, we have fetch in node 18+ natively
async function test() {
  // We need to login as Admin first to get a token
  let res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '0909987220', password: '123' }) // The password might be 123456
  });
  let data = await res.json();
  if (data.error) {
     res = await fetch('http://localhost:3000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ phone: '0909987220', password: '123456' }) 
     });
     data = await res.json();
  }
  const token = data.token;
  console.log("Token:", token);

  // Now let's try to delete a user. First fetch users
  res = await fetch('http://localhost:3000/api/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const users = await res.json();
  const userToDelete = users[users.length - 1]; // get last user
  if (!userToDelete) return console.log('No users to delete');
  
  console.log("Trying to delete user:", userToDelete.UserID);
  res = await fetch(`http://localhost:3000/api/users/${userToDelete.UserID}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log("Delete status:", res.status);
  console.log("Delete response:", text);
}
test();
