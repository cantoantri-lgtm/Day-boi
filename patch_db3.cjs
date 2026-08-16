const fs = require('fs');
let code = fs.readFileSync('server/db.ts', 'utf8');

function removeTryCatch(funcName) {
  const startIdx = code.indexOf(`async function ${funcName}`);
  if (startIdx === -1) return;
  const endIdx = code.indexOf('}', code.indexOf('catch (err: any) {', startIdx)) + 1;
  const oldFunc = code.substring(startIdx, endIdx);
  console.log('Replacing:', funcName);
  
  let newFunc = '';
  if (funcName === 'appendRow') {
    newFunc = `async function appendRow(sheetName: string, values: any[]) {
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
  if (json.error) throw new Error(json.error);
}`;
  } else if (funcName === 'updateRow') {
    newFunc = `async function updateRow(sheetName: string, rowIndex: number, values: any[]) {
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
  if (json.error) throw new Error(json.error);
}`;
  } else if (funcName === 'deleteRow') {
    newFunc = `async function deleteRow(sheetName: string, rowIndex: number) {
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
  if (json.error) throw new Error(json.error);
}`;
  }
  
  code = code.replace(oldFunc, newFunc);
}

removeTryCatch('appendRow');
removeTryCatch('updateRow');
removeTryCatch('deleteRow');

fs.writeFileSync('server/db.ts', code);
