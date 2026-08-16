fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '0903838892', password: '123' })
}).then(r => r.json()).then(res => {
  console.log('Login Response:', res);
});
