async function test() {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  
  // Try to append a row, then delete it.
  let res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'appendRow', sheetName: 'Users', values: ['test_del', '1', '2', '3', '4', '5', '6', '7'] })
  });
  console.log('Append:', await res.json());
  
  // We don't know the exact row index, let's just fetch all rows to find it
  res = await fetch(url + '?sheetName=Users');
  let json = await res.json();
  let rows = json.data;
  let index = rows.findIndex(r => r[0] === 'test_del');
  console.log('Found at index:', index);
  
  if (index !== -1) {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteRow', sheetName: 'Users', rowIndex: index + 1 })
    });
    console.log('Delete:', await res.json());
  }
}
test();
