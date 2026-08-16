const fs = require('fs');
let code = fs.readFileSync('server/sheets.ts', 'utf8');

const oldRows = `  return dataRows.map(row => {
    const obj: any = {};
    actualHeaders.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : null;
    });
    return obj as T;
  });`;

const newRows = `  return dataRows
  .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
  .map(row => {
    const obj: any = {};
    actualHeaders.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : null;
    });
    return obj as T;
  });`;

code = code.replace(oldRows, newRows);
fs.writeFileSync('server/sheets.ts', code);
console.log('Fixed rowsToObjects');
