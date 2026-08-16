const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

// Add state
code = code.replace(
  '  const [editingSchedule, setEditingSchedule] = useState<any>(null);',
  '  const [editingSchedule, setEditingSchedule] = useState<any>(null);\n  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);\n  const [deleteError, setDeleteError] = useState("");\n  const [deleting, setDeleting] = useState(false);'
);

const oldDelete = `  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá lịch dạy này?')) {
      try {
        await fetchApi(\`/schedules/\${scheduleId}\`, { method: 'DELETE' });
        setShowForm(false);
        setEditingSchedule(null);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };`;

const newDelete = `  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await fetchApi(\`/schedules/\${deleteConfirmId}\`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      setDeleteError(err.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };`;

code = code.replace(oldDelete, newDelete);

code = code.replace(
  'onClick={() => handleDelete(schedule.ScheduleID)}',
  'onClick={() => setDeleteConfirmId(schedule.ScheduleID)}'
);
code = code.replace(
  'onClick={() => handleDelete(editingSchedule.ScheduleID)}',
  'onClick={() => setDeleteConfirmId(editingSchedule.ScheduleID)}'
);


const modalCode = `
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Xác nhận xóa lịch dạy
              </h2>
              <button onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium">
                Bạn có chắc chắn muốn XÓA VĨNH VIỄN lịch dạy này không? Hành động này không thể hoàn tác.
              </p>
              {deleteError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace('    </div>\n  );\n}', modalCode);
fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
console.log("Updated ManageSchedules.tsx");
