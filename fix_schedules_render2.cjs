const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const oldRender = `{student?.FullName ? (
                        <>
                          <span className="font-bold text-slate-800 truncate">{student.FullName}</span>
                          {pool?.PoolName && <span className="text-slate-500 truncate text-[9px] sm:text-[10px] shrink-0">- {pool.PoolName}</span>}
                        </>
                      ) : (
                        <span className="text-slate-500 italic truncate font-medium">{pool?.PoolName || 'Chưa có học viên'}</span>
                      )}`;

const newRender = `{student?.FullName ? (
                        <>
                          <span className="font-bold text-slate-800 truncate">{student.FullName}</span>
                          {pool?.PoolName && <span className="text-slate-500 truncate text-[9px] sm:text-[10px] shrink-0">- {pool.PoolName}</span>}
                        </>
                      ) : (
                        <span className="text-slate-500 italic truncate font-medium text-[10px] sm:text-[11px]">{pool?.PoolName || 'Lịch trống'}</span>
                      )}`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
