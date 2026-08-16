const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

// I need to properly replace appendRow, updateRow, deleteRow.
const appendStart = code.indexOf('async function appendRow');
const appendEnd = code.indexOf('async function updateRow');

const updateEnd = code.indexOf('async function deleteRow');

const deleteEnd = code.indexOf('// Users');

let newCode = code.substring(0, appendStart);

newCode += `async function appendRow(sheetName: string, values: any[]) {
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

`;

newCode += `async function updateRow(sheetName: string, rowIndex: number, values: any[]) {
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

`;

newCode += `async function deleteRow(sheetName: string, rowIndex: number) {
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

`;

newCode += code.substring(deleteEnd);

fs.writeFileSync('server/db.ts', newCode);
console.log('Fixed DB functions');
