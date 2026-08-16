const jwt = require('jsonwebtoken');
const token = jwt.sign({ UserID: '3caa74a3-e3bd-4aad-b22b-076b44fac4bd', Role: 'Teacher, Admin', FullName: 'Nguyen Thanh Nam' }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', { expiresIn: '7d' });

fetch('http://localhost:3000/api/users', { headers: { 'Authorization': 'Bearer ' + token }})
.then(r=>r.json()).then(users => {
  console.log(users);
});
