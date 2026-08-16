import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Check, X } from 'lucide-react';
import { formatTime } from '../../lib/format';

export default function Approvals() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{id: string, status: string} | null>(null);
  const [actionError, setActionError] = useState("");
  const [acting, setActing] = useState(false);
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regs, stds, pls, scheds] = await Promise.all([
        fetchApi('/registrations'),
        fetchApi('/users/students'),
        fetchApi('/pools'),
        fetchApi('/schedules')
      ]);
      setRegistrations(regs);
      setStudents(stds);
      setPools(pls);
      setSchedules(scheds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActing(true);
    setActionError("");
    try {
      await fetchApi(`/registrations/${confirmAction.id}/approve`, {
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
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  const filteredRegs = filter === 'All' ? registrations : registrations.filter(r => r.ApprovalStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Duyệt đăng ký học</h1>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setFilter('All')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'All' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('Pending')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'Pending' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Chờ duyệt
          </button>
          <button 
            onClick={() => setFilter('Approved')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'Approved' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Đã duyệt
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-50 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-sky-50">
              <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Hồ bơi / Lịch học</th>
                <th className="px-6 py-3">Ngày đăng ký</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredRegs.map(reg => {
                const student = students.find(s => s.UserID === reg.StudentID);
                const pool = pools.find(p => p.PoolID === reg.PoolID);
                const schedule = schedules.find(s => s.ScheduleID === reg.ScheduleID);
                return (
                  <tr key={reg.RegistrationID}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{student?.FullName}</div>
                      <div className="text-xs text-slate-400">{student?.PhoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {pool?.PoolName}
                      <br/>
                      <span className="text-xs text-sky-500 font-medium">
                        {reg.ScheduleID === 'CUSTOM' ? (
                          <>{reg.Notes}</>
                        ) : schedule ? (
                          <>{schedule.DayOfWeek} | {formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}</>
                        ) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(reg.RegisteredAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        reg.ApprovalStatus === 'Approved' ? 'bg-green-100 text-green-600' :
                        reg.ApprovalStatus === 'Pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {reg.ApprovalStatus === 'Approved' ? 'Đã duyệt' : reg.ApprovalStatus === 'Pending' ? 'Chờ duyệt' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {reg.ApprovalStatus === 'Pending' && (
                        <>
                          <button 
                            onClick={() => setConfirmAction({id: reg.RegistrationID, status: 'Approved'})}
                            className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded font-bold hover:bg-green-100 transition-colors"
                            title="Duyệt"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => setConfirmAction({id: reg.RegistrationID, status: 'Rejected'})}
                            className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded font-bold hover:bg-red-100 transition-colors"
                            title="Từ chối"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      {reg.ApprovalStatus === 'Approved' && (
                        <button 
                          onClick={() => handleAction(reg.RegistrationID, 'Pending')}
                          className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded font-bold hover:bg-red-100 transition-colors"
                          title="Hủy duyệt"
                        >
                          Hủy duyệt
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredRegs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Không có đăng ký nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                className={`${confirmAction.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2`}
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
}
