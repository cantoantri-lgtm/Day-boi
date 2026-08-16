const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const targetStr = `  if (filterStatus) {
    displaySchedules = displaySchedules.filter(s => s.Status === filterStatus);
  }`;

const replacementStr = `  if (filterStatus) {
    displaySchedules = displaySchedules.filter(s => s.Status === filterStatus);
  }
  
  // Hide empty schedules completely
  displaySchedules = displaySchedules.filter(s => {
    const linkedReg = registrations.find(r => r.ScheduleID === s.ScheduleID);
    return students.some(st => st.UserID === linkedReg?.StudentID);
  });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log('Successfully hid empty schedules');
} else {
  console.log('Could not find target string');
}
