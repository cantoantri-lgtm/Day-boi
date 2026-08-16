const url = process.env.APPS_SCRIPT_URL;
async function test() {
  let res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateRow', sheetName: 'Users', rowIndex: 7, values: ['', '', '', '', '', '', '', ''] })
  });
  console.log('Update:', await res.json());
}
test();
