const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const newSubmit = `  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(formData.DayTimes).length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }
    
    try {
      const { StudentID, DayTimes, PoolID, TeacherID } = formData;
      const actualTeacherID = isAdmin ? TeacherID : (user?.UserID || '');
       
      if (editingSchedule) {
        const [dayOfWeek, time] = Object.entries(DayTimes)[0] || [editingSchedule.DayOfWeek, {start: editingSchedule.StartTime, end: editingSchedule.EndTime}];
        
        const dataToSubmit = {
          PoolID,
          TeacherID: actualTeacherID,
          DayOfWeek: dayOfWeek,
          StartTime: time.start,
          EndTime: time.end,
          MaxStudents: '1',
          Status: 'Active'
        };

        await fetchApi(\`/schedules/\${editingSchedule.ScheduleID}\`, {
          method: 'PUT',
          body: JSON.stringify(dataToSubmit)
        });
        
        // Update registration if student changed
        const existingReg = registrations.find(r => r.ScheduleID === editingSchedule.ScheduleID);
        if (StudentID && existingReg && existingReg.StudentID !== StudentID) {
           // We would update registration here if the API supported it
        } else if (StudentID && !existingReg) {
            await fetchApi('/registrations', {
              method: 'POST',
              body: JSON.stringify({ 
                 ScheduleID: editingSchedule.ScheduleID, 
                 PoolID: formData.PoolID, 
                 StudentID: StudentID, 
                 ApprovalStatus: 'Approved'
              })
            });
        }
      } else {
        for (const [day, time] of Object.entries(DayTimes)) {
          const dataToSubmit = {
            PoolID,
            TeacherID: actualTeacherID,
            DayOfWeek: day,
            StartTime: time.start,
            EndTime: time.end,
            MaxStudents: '1',
            Status: 'Active'
          };
          
          const scheduleRes = await fetchApi('/schedules', {
            method: 'POST',
            body: JSON.stringify(dataToSubmit)
          });
          
          if (StudentID) {
            await fetchApi('/registrations', {
              method: 'POST',
              body: JSON.stringify({ 
                 ScheduleID: scheduleRes.ScheduleID, 
                 PoolID: formData.PoolID, 
                 StudentID: StudentID, 
                 ApprovalStatus: 'Approved'
              })
            });
          }
        }
      }
      
      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };`;

const startIndex = code.indexOf('  const handleSubmit = async');
const endIndex = code.indexOf('  const handleDelete = async');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newSubmit + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log('Replaced handleSubmit');
} else {
  console.log('Could not find indices');
}
