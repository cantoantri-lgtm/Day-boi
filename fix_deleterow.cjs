const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

const deleteRowImpl = `async function deleteRow(sheetName: string, rowIndex: number) {
  try {
    const url = process.env.APPS_SCRIPT_URL;
    if (!url) {
      console.log(\`[Fallback] APPS_SCRIPT_URL not set. Using in-memory db for deleteRow(\${sheetName})\`);
      inMemoryData[sheetName].splice(rowIndex - 1, 1);
      return;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteRow', sheetName, rowIndex })
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error);
  } catch (err: any) {
    console.log(\`Error deleting row in \${sheetName}:\`, err.message);
    console.log(\`[Fallback] Using in-memory db for deleteRow(\${sheetName})\`);
    inMemoryData[sheetName].splice(rowIndex - 1, 1);
  }
}

// Users`;

code = code.replace('// Users', deleteRowImpl);
fs.writeFileSync('server/db.ts', code);
console.log('Added deleteRow');
