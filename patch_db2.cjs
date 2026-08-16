const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

const appendRowRegex = /async function appendRow[\\s\\S]*?inMemoryData\\[sheetName\\]\\.push\\(values\\);\n  }/;
const updateRowRegex = /async function updateRow[\\s\\S]*?inMemoryData\\[sheetName\\]\\[rowIndex - 1\\] = values;\n  }/;
const deleteRowRegex = /async function deleteRow[\\s\\S]*?inMemoryData\\[sheetName\\]\\.splice\\(rowIndex - 1, 1\\);\n  }/;

code = code.replace(appendRowRegex, `async function appendRow(sheetName: string, values: any[]) {
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
}`);

code = code.replace(updateRowRegex, `async function updateRow(sheetName: string, rowIndex: number, values: any[]) {
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
}`);

code = code.replace(deleteRowRegex, `async function deleteRow(sheetName: string, rowIndex: number) {
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
}`);

fs.writeFileSync('server/db.ts', code);
console.log('Patch complete.');
