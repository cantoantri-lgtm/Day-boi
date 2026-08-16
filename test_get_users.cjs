const jwt = require('jsonwebtoken');
const token = jwt.sign({ UserID: 'e0b2e76c-7748-4bde-8fdb-d7cb2e4e6e7d', Role: 'Admin', FullName: 'Can Toan Tri' }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', { expiresIn: '7d' });

fetch('http://localhost:3000/api/users', { headers: { 'Authorization': 'Bearer ' + token } })
.then(r => r.json()).then(res => {
  const nam = res.find(u => u.FullName.includes('Nam'));
  console.log('Nam from API:', nam);
});
