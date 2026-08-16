const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

// Remove showEmpty state
code = code.replace(
  'const [filterStatus, setFilterStatus] = useState("");\n  const [showEmpty, setShowEmpty] = useState(false);',
  'const [filterStatus, setFilterStatus] = useState("");'
);

// Remove the checkbox UI
const targetUI = `<label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showEmpty} 
              onChange={e => setShowEmpty(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Hiện giờ trống
          </label>`;

if (code.includes(targetUI)) {
  code = code.replace(targetUI, "");
}

fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
console.log('Removed checkbox');
