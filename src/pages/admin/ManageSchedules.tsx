import React from "react";
import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, MapPin, Clock, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

import { formatTime } from '../../lib/format';

export default function ManageSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPool, setFilterPool] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<{
    PoolID: string;
    TeacherID: string;
    StudentID: string;
    DayTimes: { [day: string]: { start: string, end: string } };
    MaxStudents: string;
    Status: string;
  }>({
    PoolID: '',
    TeacherID: '',
    StudentID: '',
    DayTimes: {},
    MaxStudents: '1',
    Status: 'Active'
  });

  const userRoles = user?.Role ? user.Role.split(',').map((r: string) => r.trim()) : [];
  const isAdmin = userRoles.includes('Admin');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      fetchApi('/schedules'),
      fetchApi('/pools'),
      fetchApi('/users/teachers'),
      fetchApi('/users/students'),
      fetchApi('/registrations')
    ]).then(([scheds, pls, tchs, stds, regs]) => {
      setSchedules(scheds);
      setPools(pls);
      setTeachers(tchs);
      setStudents(stds);
      setRegistrations(regs);
      setLoading(false);
    });
  };

  const getDayOfWeekName = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayName = getDayOfWeekName(date);
    setFormData(prev => ({ ...prev, DayTimes: { [dayName]: { start: '08:00', end: '10:00' } } }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(formData.DayTimes).length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }
    
    setSaving(true);
    try {
      const { StudentID, DayTimes, PoolID, TeacherID } = formData;
      const actualTeacherID = isAdmin ? TeacherID : (user?.UserID || '');
       
      if (editingSchedule) {
        const [dayOfWeek, time] = (Object.entries(DayTimes)[0] as [string, {start: string, end: string}]) || [editingSchedule.DayOfWeek, {start: editingSchedule.StartTime, end: editingSchedule.EndTime}];
        
        const dataToSubmit = {
          PoolID,
          TeacherID: actualTeacherID,
          DayOfWeek: dayOfWeek,
          StartTime: time.start,
          EndTime: time.end,
          MaxStudents: '1',
          Status: 'Active'
        };

        await fetchApi(`/schedules/${editingSchedule.ScheduleID}`, {
          method: 'PUT',
          body: JSON.stringify(dataToSubmit)
        });
        
        // Update registration if student changed
        const existingReg = registrations.find(r => r.ScheduleID === editingSchedule.ScheduleID);
        if (StudentID && existingReg && existingReg.StudentID !== StudentID) {
           // We would update registration here if the API supported it
        } else if (StudentID && !existingReg) {
            await fetchApi('/registrations', {
              method: 'POST',
              body: JSON.stringify({ 
                 ScheduleID: editingSchedule.ScheduleID, 
                 PoolID: formData.PoolID, 
                 StudentID: StudentID, 
                 ApprovalStatus: 'Approved'
              })
            });
        }
      } else {
        for (const [day, time] of Object.entries(DayTimes) as [string, {start: string, end: string}][]) {
          const dataToSubmit = {
            PoolID,
            TeacherID: actualTeacherID,
            DayOfWeek: day,
            StartTime: time.start,
            EndTime: time.end,
            MaxStudents: '1',
            Status: 'Active'
          };
          
          const scheduleRes = await fetchApi('/schedules', {
            method: 'POST',
            body: JSON.stringify(dataToSubmit)
          });
          
          if (StudentID) {
            await fetchApi('/registrations', {
              method: 'POST',
              body: JSON.stringify({ 
                 ScheduleID: scheduleRes.ScheduleID, 
                 PoolID: formData.PoolID, 
                 StudentID: StudentID, 
                 ApprovalStatus: 'Approved'
              })
            });
          }
        }
      }
      
      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await fetchApi(`/schedules/${deleteConfirmId}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      setShowForm(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      setDeleteError(err.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (schedule: any) => {
    const linkedReg = registrations.find(r => r.ScheduleID === schedule.ScheduleID);
    setFormData({
      PoolID: schedule.PoolID || '',
      TeacherID: schedule.TeacherID || '',
      StudentID: linkedReg?.StudentID || '',
      DayTimes: {
        [schedule.DayOfWeek || 'Thứ 2']: {
          start: schedule.StartTime || '08:00',
          end: schedule.EndTime || '10:00'
        }
      },
      MaxStudents: schedule.MaxStudents || '1',
      Status: schedule.Status || 'Active'
    });
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  let displaySchedules = schedules;
  if (!isAdmin && userRoles.includes('Teacher')) {
    displaySchedules = displaySchedules.filter(s => s.TeacherID === user?.UserID);
  }
  if (filterPool) {
    displaySchedules = displaySchedules.filter(s => s.PoolID === filterPool);
  }
  if (filterStatus) {
    displaySchedules = displaySchedules.filter(s => s.Status === filterStatus);
  }
  
  // Hide empty schedules completely
  displaySchedules = displaySchedules.filter(s => {
    const linkedReg = registrations.find(r => r.ScheduleID === s.ScheduleID);
    return students.some(st => st.UserID === linkedReg?.StudentID);
  });
  
  const selectedDayName = getDayOfWeekName(selectedDate);
  const schedulesForSelectedDay = displaySchedules.filter(s => s.DayOfWeek === selectedDayName);

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDaysHeader = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch dạy</h1>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-sky-700 capitalize min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: vi })}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterPool}
            onChange={(e) => setFilterPool(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
          >
            <option value="">Tất cả hồ bơi</option>
            {pools.map(p => (
              <option key={p.PoolID} value={p.PoolID}>{p.PoolName}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Đang học (Active)</option>
            <option value="Inactive">Tạm dừng (Inactive)</option>
          </select>

          <button 
            onClick={() => {
              setFormData({
                PoolID: pools[0]?.PoolID || '',
                TeacherID: isAdmin ? (teachers[0]?.UserID || '') : (user?.UserID || ''),
                StudentID: students[0]?.UserID || '',
                DayTimes: { 'Thứ 2': { start: '08:00', end: '10:00' } },
                MaxStudents: '1',
                Status: 'Active'
              });
              setEditingSchedule(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm lịch
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="flex-1 border border-slate-200 bg-slate-200 gap-px grid grid-cols-7 rounded-xl overflow-hidden min-h-[600px]">
        {/* Day Headers */}
        {weekDaysHeader.map(d => (
          <div key={d} className="bg-sky-50 py-3 text-center font-bold text-sm text-sky-900 border-b border-slate-200 shadow-sm z-10">
            {d}
          </div>
        ))}

        {/* Days */}
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayName = getDayOfWeekName(day);
          
          // Lịch lặp lại theo thứ, nên lấy tất cả lịch có DayOfWeek khớp với cột hiện tại
          const daySchedules = displaySchedules.filter(s => s.DayOfWeek === dayName);

          return (
            <div key={i} className={`bg-white min-h-[140px] flex flex-col p-1.5 sm:p-2 ${!isCurrentMonth ? 'opacity-40' : ''}`}>
              <div className="text-right text-sm font-semibold mb-2 text-slate-400">
                {format(day, 'd')}
              </div>
              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                {Object.values(daySchedules.reduce((acc, schedule) => {
                  const key = `${schedule.StartTime}-${schedule.EndTime}-${schedule.PoolID}`;
                  if (!acc[key]) {
                    acc[key] = {
                      primarySchedule: schedule,
                      students: [],
                      poolName: pools.find(p => p.PoolID === schedule.PoolID)?.PoolName || ''
                    };
                  }
                  const linkedReg = registrations.find(r => r.ScheduleID === schedule.ScheduleID);
                  const student = students.find(s => s.UserID === linkedReg?.StudentID);
                  if (student?.FullName) {
                    const nameParts = student.FullName.trim().split(' ');
                    const firstName = nameParts[nameParts.length - 1];
                    acc[key].students.push(firstName);
                  }
                  return acc;
                }, {} as Record<string, { primarySchedule: any, students: string[], poolName: string }>))
                .sort((a, b) => a.primarySchedule.StartTime.localeCompare(b.primarySchedule.StartTime))
                .map(group => {
                  const { primarySchedule, students, poolName } = group;
                  const numStudents = students.length;
                  let studentsDisplay = '';
                  if (numStudents === 0) {
                    studentsDisplay = poolName || 'Lịch trống';
                  } else if (numStudents <= 2) {
                    studentsDisplay = students.join(', ');
                  } else {
                    studentsDisplay = `${students.slice(0, 2).join(', ')}...`;
                  }

                  return (
                    <div 
                      key={primarySchedule.ScheduleID} 
                      onClick={() => handleEdit(primarySchedule)} 
                      className="shrink-0 group cursor-pointer bg-sky-50/80 hover:bg-sky-100 border border-sky-100 p-1 sm:p-1.5 rounded transition-colors text-left relative overflow-hidden flex items-center text-[10px] sm:text-[11px] gap-1"
                      title={`${formatTime(primarySchedule.StartTime)} - ${formatTime(primarySchedule.EndTime)}${numStudents > 0 ? ': ' + students.join(', ') : ' (Chưa có học viên)'}${poolName ? ' tại ' + poolName : ''}`}
                    >
                      <span className="font-bold text-sky-700 shrink-0">{formatTime(primarySchedule.StartTime)}</span>
                      {numStudents > 0 ? (
                        <>
                          <span className="font-bold text-slate-800 truncate">{studentsDisplay}</span>
                          {poolName && <span className="text-slate-500 truncate text-[9px] sm:text-[10px] shrink-0">- {poolName}</span>}
                        </>
                      ) : (
                        <span className="text-slate-500 italic truncate font-medium text-[10px] sm:text-[11px]">{studentsDisplay}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingSchedule ? 'Sửa lịch dạy' : 'Thêm lịch mới'}</h2>
              <button onClick={() => { setShowForm(false); setEditingSchedule(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hồ bơi</label>
                  <select 
                    required
                    value={formData.PoolID}
                    onChange={e => setFormData({...formData, PoolID: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 bg-slate-50"
                  >
                    <option value="">-- Chọn hồ bơi --</option>
                    {pools.map(p => (
                      <option key={p.PoolID} value={p.PoolID}>{p.PoolName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Học viên</label>
                  <select 
                    required
                    value={formData.StudentID}
                    onChange={e => setFormData({...formData, StudentID: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 bg-slate-50"
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {students.map(s => (
                      <option key={s.UserID} value={s.UserID}>{s.FullName}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Giáo viên</label>
                    <select 
                      required
                      value={formData.TeacherID}
                      onChange={e => setFormData({...formData, TeacherID: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 bg-slate-50"
                    >
                      <option value="">-- Chọn giáo viên --</option>
                      {teachers.map(t => (
                        <option key={t.UserID} value={t.UserID}>{t.FullName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2 lg:col-span-4">
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
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
                {editingSchedule ? (
                  <button 
                    type="button" 
                    onClick={() => setDeleteConfirmId(editingSchedule.ScheduleID)}
                    className="px-4 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa lịch này
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setShowForm(false); setEditingSchedule(null); }}
                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingSchedule ? 'Cập nhật lịch' : 'Thêm lịch dạy'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
