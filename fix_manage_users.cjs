const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageUsers.tsx', 'utf8');

// Add state
code = code.replace(
  '  const [saving, setSaving] = useState(false);',
  '  const [saving, setSaving] = useState(false);\n  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);\n  const [deleteError, setDeleteError] = useState("");'
);

// Replace handleRealDelete
const oldDelete = `  const handleRealDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này? Hành động này không thể hoàn tác!')) return;
    try {
      await fetchApi(\`/users/\${userId}\`, {
        method: 'DELETE'
      });
      loadUsers();
    } catch (err: any) {
      alert('Có lỗi xảy ra khi xóa: ' + err.message);
    }
  };`;

const newDelete = `  const handleRealDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteError("");
    setSaving(true);
    try {
      await fetchApi(\`/users/\${deleteConfirmId}\`, {
        method: 'DELETE'
      });
      setDeleteConfirmId(null);
      loadUsers();
    } catch (err: any) {
      setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
    } finally {
      setSaving(false);
    }
  };`;

code = code.replace(oldDelete, newDelete);

// Replace delete button onClick
code = code.replace(
  'onClick={() => handleRealDelete(user.UserID)}',
  'onClick={() => setDeleteConfirmId(user.UserID)}'
);

// Add delete modal before the closing div
const modalCode = `
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Xác nhận xóa người dùng
              </h2>
              <button onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium">
                Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này không? Hành động này không thể hoàn tác.
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
                onClick={handleRealDelete}
                disabled={saving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

fs.writeFileSync('src/pages/admin/ManageUsers.tsx', code);
console.log("Updated ManageUsers.tsx");
