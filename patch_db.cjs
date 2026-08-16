const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

code = code.replace(/async function appendRow[\\s\\S]*?async function updateRow/, function(match) {
  return `async function appendRow(sheetName: string, values: any[]) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName].push(values);
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'appendRow', sheetName, values })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

async function updateRow`;
});

code = code.replace(/async function updateRow[\\s\\S]*?async function deleteRow/, function(match) {
  return `async function updateRow(sheetName: string, rowIndex: number, values: any[]) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName][rowIndex - 1] = values;
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateRow', sheetName, rowIndex, values })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

async function deleteRow`;
});

code = code.replace(/async function deleteRow[\\s\\S]*?\/\/ Users/, function(match) {
  return `async function deleteRow(sheetName: string, rowIndex: number) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName].splice(rowIndex - 1, 1);
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteRow', sheetName, rowIndex })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

// Users`;
});

fs.writeFileSync('server/db.ts', code);
console.log('Removed silent fallback in db.ts');
