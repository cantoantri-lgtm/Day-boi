async function test() {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  
  // Try to use deleteRow
  let res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteRow', sheetName: 'Users', rowIndex: 100 })
  });
  const text = await res.text();
  console.log('Delete Response:', text);
}
test();
