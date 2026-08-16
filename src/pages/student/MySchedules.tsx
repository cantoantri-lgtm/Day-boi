import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Calendar, Clock } from 'lucide-react';
import { formatTime } from '../../lib/format';

export default function MySchedules() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/registrations'),
      fetchApi('/schedules'),
      fetchApi('/pools')
    ]).then(([regs, scheds, poolsData]) => {
      setRegistrations(regs);
      setSchedules(scheds);
      setPools(poolsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Lịch của tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registrations.map(reg => {
          const schedule = schedules.find(s => s.ScheduleID === reg.ScheduleID);
          const pool = pools.find(p => p.PoolID === reg.PoolID);
          if (!pool) return null;

          return (
            <div key={reg.RegistrationID} className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  reg.ApprovalStatus === 'Approved' ? 'bg-green-100 text-green-600' :
                  reg.ApprovalStatus === 'Pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {reg.ApprovalStatus === 'Approved' ? 'Đã duyệt' : reg.ApprovalStatus === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-1">{pool.PoolName}</h3>
              <p className="text-xs font-medium text-slate-500 mb-4">{pool.Address}</p>

              <div className="space-y-2 text-sm text-slate-700 bg-sky-50 p-4 rounded-xl border border-sky-100">
                {reg.ScheduleID === 'CUSTOM' ? (
                  <div className="text-sm font-medium text-slate-600 leading-relaxed">{reg.Notes}</div>
                ) : schedule ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-sky-500" />
                      <span className="font-semibold">{schedule.DayOfWeek}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span className="font-medium">{formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500">Lịch học không còn tồn tại</div>
                )}
              </div>
            </div>
          )
        })}
        
        {registrations.length === 0 && (
          <div className="col-span-full bg-white p-8 rounded-2xl text-center text-slate-400 text-sm font-medium border border-sky-50">
            Bạn chưa đăng ký lịch học nào.
          </div>
        )}
      </div>
    </div>
  );
}
