const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

// Add filter state
code = code.replace(
  'const [filterStatus, setFilterStatus] = useState("");',
  'const [filterStatus, setFilterStatus] = useState("");\n  const [showEmpty, setShowEmpty] = useState(false);'
);

// Modify displaySchedules filtering
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

// Add the checkbox to the UI next to the selects
const oldSelects = `<select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Tạm dừng</option>
          </select>`;

const newSelects = `<select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Tạm dừng</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showEmpty} 
              onChange={e => setShowEmpty(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Hiện giờ trống
          </label>`;

code = code.replace(oldSelects, newSelects);

fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
console.log('Fixed schedules filter');
