const fs = require('fs');
const file = 'src/lib/api.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('if (res.status === 401)')) {
  code = code.replace(
    '  if (!res.ok) {\n    throw new Error(data.error || \'API Error\');\n  }',
    `  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'API Error');
  }`
  );
  fs.writeFileSync(file, code);
  console.log('Fixed api.ts to handle 401');
} else {
  console.log('Already handled');
}
