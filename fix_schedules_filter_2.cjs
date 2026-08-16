const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

if (!code.includes('showEmpty')) {
  // Add state
  code = code.replace(
    'const [filterStatus, setFilterStatus] = useState("");',
    'const [filterStatus, setFilterStatus] = useState("");\n  const [showEmpty, setShowEmpty] = useState(false);'
  );

  // Add filter logic
  const oldFilter = `  const displaySchedules = schedules.filter(s => {
    if (filterPool && s.PoolID !== filterPool) return false;
    if (filterStatus && s.Status !== filterStatus) return false;
    if (user?.Role === 'Teacher' && s.TeacherID !== user.UserID) return false;
    return true;
  });`;

  const newFilter = `  const displaySchedules = schedules.filter(s => {
    if (filterPool && s.PoolID !== filterPool) return false;
    if (filterStatus && s.Status !== filterStatus) return false;
    if (user?.Role === 'Teacher' && s.TeacherID !== user.UserID) return false;
    
    const linkedReg = registrations.find(r => r.ScheduleID === s.ScheduleID);
    const hasStudent = students.some(st => st.UserID === linkedReg?.StudentID);
    
    if (!showEmpty && !hasStudent) return false;
    
    return true;
  });`;

  code = code.replace(oldFilter, newFilter);

  // Add checkbox UI
  const searchStr = `<option value="Inactive">Tạm dừng</option>\n          </select>`;
  const replacement = `<option value="Inactive">Tạm dừng</option>\n          </select>\n          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">\n            <input \n              type="checkbox" \n              checked={showEmpty} \n              onChange={e => setShowEmpty(e.target.checked)}\n              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"\n            />\n            Hiện giờ trống\n          </label>`;

  code = code.replace(searchStr, replacement);
  
  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log('Applied');
} else {
  console.log('Already applied');
}
