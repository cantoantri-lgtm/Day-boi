const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const oldRender = `<span className="font-bold text-slate-800 truncate">{student?.FullName || 'Trống'}</span>
                      <span className="text-slate-500 truncate text-[9px] sm:text-[10px] shrink-0">- {pool?.PoolName}</span>`;

const newRender = `{student?.FullName ? (
                        <>
                          <span className="font-bold text-slate-800 truncate">{student.FullName}</span>
                          {pool?.PoolName && <span className="text-slate-500 truncate text-[9px] sm:text-[10px] shrink-0">- {pool.PoolName}</span>}
                        </>
                      ) : (
                        <span className="text-slate-500 italic truncate font-medium">{pool?.PoolName || 'Chưa có học viên'}</span>
                      )}`;

code = code.replace(oldRender, newRender);

const oldTitle = `title={\`\${formatTime(schedule.StartTime)} - \${formatTime(schedule.EndTime)}: \${student?.FullName || 'Trống'} tại \${pool?.PoolName}\`}`;
const newTitle = `title={\`\${formatTime(schedule.StartTime)} - \${formatTime(schedule.EndTime)}\${student?.FullName ? ': ' + student.FullName : ' (Chưa có học viên)'}\${pool?.PoolName ? ' tại ' + pool.PoolName : ''}\`}`;
code = code.replace(oldTitle, newTitle);

fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
console.log('Fixed render');
