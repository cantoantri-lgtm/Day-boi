const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Approvals.tsx', 'utf8');

code = code.replace(
  '  const [loading, setLoading] = useState(true);',
  '  const [loading, setLoading] = useState(true);\n  const [confirmAction, setConfirmAction] = useState<{id: string, status: string} | null>(null);\n  const [actionError, setActionError] = useState("");\n  const [acting, setActing] = useState(false);'
);

const oldAction = `  const handleAction = async (id: string, status: string) => {
    if (!window.confirm(\`Bạn có chắc chắn muốn \${status === 'Approved' ? 'Duyệt' : 'Hủy'} đăng ký này?\`)) return;
    try {
      await fetchApi(\`/registrations/\${id}/approve\`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };`;

const newAction = `  const handleAction = async () => {
    if (!confirmAction) return;
    setActing(true);
    setActionError("");
    try {
      await fetchApi(\`/registrations/\${confirmAction.id}/approve\`, {
        method: 'PUT',
        body: JSON.stringify({ status: confirmAction.status })
      });
      setConfirmAction(null);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Có lỗi xảy ra');
    } finally {
      setActing(false);
    }
  };`;

code = code.replace(oldAction, newAction);

code = code.replace(
  "onClick={() => handleAction(reg.RegistrationID, 'Approved')}",
  "onClick={() => setConfirmAction({id: reg.RegistrationID, status: 'Approved'})}"
);
code = code.replace(
  "onClick={() => handleAction(reg.RegistrationID, 'Rejected')}",
  "onClick={() => setConfirmAction({id: reg.RegistrationID, status: 'Rejected'})}"
);

const modalCode = `
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-sky-100 flex justify-between items-center bg-sky-50">
              <h2 className="text-lg font-bold text-sky-800">
                Xác nhận {confirmAction.status === 'Approved' ? 'duyệt' : 'hủy'} đăng ký
              </h2>
              <button onClick={() => { setConfirmAction(null); setActionError(""); }} className="text-sky-400 hover:text-sky-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium">
                Bạn có chắc chắn muốn {confirmAction.status === 'Approved' ? 'Duyệt' : 'Hủy'} đăng ký này không?
              </p>
              {actionError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                  {actionError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => { setConfirmAction(null); setActionError(""); }}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleAction}
                disabled={acting}
                className={\`\${confirmAction.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2\`}
              >
                {acting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace('    </div>\n  );\n}', modalCode);
fs.writeFileSync('src/pages/admin/Approvals.tsx', code);
