const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const newEdit = `  const handleEdit = (schedule: any) => {
    const linkedReg = registrations.find(r => r.ScheduleID === schedule.ScheduleID);
    setFormData({
      PoolID: schedule.PoolID || '',
      TeacherID: schedule.TeacherID || '',
      StudentID: linkedReg?.StudentID || '',
      DayTimes: {
        [schedule.DayOfWeek || 'Thứ 2']: {
          start: schedule.StartTime || '08:00',
          end: schedule.EndTime || '10:00'
        }
      },
      MaxStudents: schedule.MaxStudents || '1',
      Status: schedule.Status || 'Active'
    });
    setEditingSchedule(schedule);
    setShowForm(true);
  };`;

const startIndex = code.indexOf('  const handleEdit = (schedule: any) => {');
const endIndex = code.indexOf('  if (loading) return <div className="p-4">Đang tải...</div>;');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newEdit + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log('Replaced handleEdit');
} else {
  console.log('Could not find indices', startIndex, endIndex);
}
