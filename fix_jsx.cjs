const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSchedules.tsx', 'utf8');

const newJsx = `<div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày học trong tuần {editingSchedule ? '' : '(Có thể chọn nhiều)'}</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(d => {
                      const isSelected = !!formData.DayTimes[d];
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            if (editingSchedule) {
                              setFormData(prev => ({
                                ...prev,
                                DayTimes: { [d]: prev.DayTimes[Object.keys(prev.DayTimes)[0]] || { start: '08:00', end: '10:00' } }
                              }));
                              return;
                            }
                            
                            setFormData(prev => {
                              const newDayTimes = { ...prev.DayTimes };
                              if (isSelected) {
                                delete newDayTimes[d];
                              } else {
                                newDayTimes[d] = { start: '08:00', end: '10:00' };
                              }
                              return { ...prev, DayTimes: newDayTimes };
                            });
                          }}
                          className={\`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors \${
                            isSelected
                              ? 'bg-sky-100 border-sky-500 text-sky-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-slate-50'
                          }\`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {Object.keys(formData.DayTimes).length > 0 && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Chọn giờ học cho từng ngày</label>
                    <div className="space-y-3">
                      {(Object.entries(formData.DayTimes) as [string, {start: string, end: string}][]).map(([day, time]) => (
                        <div key={day} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="w-24 font-semibold text-slate-700">{day}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              required
                              type="time"
                              value={time.start}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  DayTimes: {
                                    ...prev.DayTimes,
                                    [day]: { ...prev.DayTimes[day], start: e.target.value }
                                  }
                                }));
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-sky-500 focus:border-sky-500 outline-none"
                            />
                            <span className="text-slate-500 font-medium">-</span>
                            <input
                              required
                              type="time"
                              value={time.end}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  DayTimes: {
                                    ...prev.DayTimes,
                                    [day]: { ...prev.DayTimes[day], end: e.target.value }
                                  }
                                }));
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-sky-500 focus:border-sky-500 outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">`;

const startIdx = code.indexOf(`<div>\n                  <label className="block text-sm font-bold text-slate-700 mb-2">Thứ trong tuần</label>`);
let endIdx = code.indexOf(`<div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">`);

if (startIdx !== -1 && endIdx !== -1) {
  const toReplace = code.substring(startIdx, endIdx);
  code = code.replace(toReplace, newJsx);
  fs.writeFileSync('src/pages/admin/ManageSchedules.tsx', code);
  console.log("Replaced JSX");
} else {
  console.log("Not found", startIdx, endIdx);
}
