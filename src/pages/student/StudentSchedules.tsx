import React from "react";
import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Calendar, MapPin, Users, CheckCircle, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function StudentSchedules() {
  const [pools, setPools] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    PoolID: '',
    TeacherID: '',
    DayTimes: { 'Thứ 2': { start: '18:00', end: '19:00' } } as Record<string, { start: string; end: string }>
  });

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      fetchApi('/pools'),
      fetchApi('/users/teachers')
    ]).then(([poolsData, teachersData]) => {
      const activePools = poolsData.filter((p: any) => p.Status === 'Active');
      setPools(activePools);
      setTeachers(teachersData);
      
      if (activePools.length > 0) {
        setFormData(prev => ({ ...prev, PoolID: activePools[0].PoolID }));
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng tải lại trang.');
      setLoading(false);
    });
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.PoolID) {
      alert('Vui lòng chọn hồ bơi');
      return;
    }
    if (Object.keys(formData.DayTimes).length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }
    setRegistering(true);
    
    try {
      const teacherName = formData.TeacherID ? teachers.find(t => t.UserID === formData.TeacherID)?.FullName : 'Chưa xác định';
      const days = (Object.entries(formData.DayTimes) as [string, {start: string, end: string}][]).map(([day, time]) => `${day} (${time.start} - ${time.end})`).join(', ');
      const notes = `Giáo viên: ${teacherName} | Lịch học: ${days}`;
      
      await fetchApi('/registrations', {
        method: 'POST',
        body: JSON.stringify({ 
          ScheduleID: 'CUSTOM', 
          PoolID: formData.PoolID,
          Notes: notes
        })
      });
      alert('Đăng ký thành công! Đang chờ admin duyệt.');
      // Optional: reset form or redirect
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-sky-600" /></div>;

  const poolInfo = pools.find(p => p.PoolID === formData.PoolID);
  
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">Đăng ký lịch học bơi</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-50">
        <form onSubmit={handleRegister} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hồ bơi</label>
            <select
              required
              value={formData.PoolID}
              onChange={(e) => setFormData({...formData, PoolID: e.target.value})}
              className="w-full p-2.5 border border-sky-100 bg-sky-50 rounded-lg text-sm text-slate-700 font-medium focus:ring-sky-500 focus:border-sky-500 outline-none"
            >
              {pools.map(pool => (
                <option key={pool.PoolID} value={pool.PoolID}>{pool.PoolName}</option>
              ))}
            </select>
            
            {poolInfo && (
              <div className="mt-3 flex flex-col sm:flex-row gap-3 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-500" /> {poolInfo.Address}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-sky-500" /> Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(poolInfo.PricePerSession || '0'))} / buổi</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Giáo viên (Tùy chọn)</label>
            <select
              value={formData.TeacherID}
              onChange={(e) => setFormData({...formData, TeacherID: e.target.value})}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-sky-500 focus:border-sky-500 outline-none"
            >
              <option value="">-- Không yêu cầu / Chưa biết --</option>
              {teachers.map(t => (
                <option key={t.UserID} value={t.UserID}>{t.FullName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ngày học trong tuần (Có thể chọn nhiều)</label>
              <div className="flex flex-wrap gap-2">
                {days.map(d => {
                  const isSelected = !!formData.DayTimes[d];
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setFormData(prev => {
                          const newDayTimes = { ...prev.DayTimes };
                          if (isSelected) {
                            delete newDayTimes[d];
                          } else {
                            newDayTimes[d] = { start: '18:00', end: '19:00' };
                          }
                          return { ...prev, DayTimes: newDayTimes };
                        });
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        isSelected
                          ? 'bg-sky-100 border-sky-500 text-sky-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {Object.keys(formData.DayTimes).length > 0 && (
              <div>
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

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={registering}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {registering ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Đăng ký học bơi</>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">Yêu cầu đăng ký của bạn sẽ được gửi tới bộ phận Quản lý để xét duyệt và xếp lớp.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
