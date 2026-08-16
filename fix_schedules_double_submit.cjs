const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

if (!code.includes('const [saving, setSaving]')) {
  // Add state
  code = code.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [saving, setSaving] = useState(false);'
  );

  // Update handleSubmit
  const targetFn = `  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(formData.DayTimes).length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }
    
    try {`;
    
  const replacementFn = `  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(formData.DayTimes).length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }
    
    setSaving(true);
    try {`;
  code = code.replace(targetFn, replacementFn);

  // Add finally block to unset saving
  const catchBlock = `      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };`;

  const newCatchBlock = `      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };`;
  code = code.replace(catchBlock, newCatchBlock);

  // Update button
  const oldBtn = `<button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {editingSchedule ? 'Cập nhật lịch' : 'Thêm lịch dạy'}`;
                    
  const newBtn = `<button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingSchedule ? 'Cập nhật lịch' : 'Thêm lịch dạy'}`;
  
  code = code.replace(oldBtn, newBtn);

  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log('Fixed double submit');
} else {
  console.log('Already fixed');
}
