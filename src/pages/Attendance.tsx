import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Calendar as CalendarIcon, MapPin, User, Clock, Search } from 'lucide-react';
import { formatTime } from '../lib/format';

export default function AttendancePage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regs, stds, tchs, pls, scheds] = await Promise.all([
        fetchApi('/registrations'),
        fetchApi('/users/students'),
        fetchApi('/users/teachers'),
        fetchApi('/pools'),
        fetchApi('/schedules')
      ]);
      setRegistrations(regs);
      setStudents(stds);
      setTeachers(tchs);
      setPools(pls);
      setSchedules(scheds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  // Xây dựng danh sách các buổi dạy
  const classes: any[] = [];

  const approvedRegs = registrations.filter(r => r.ApprovalStatus === 'Approved');

  approvedRegs.forEach(reg => {
    const student = students.find(s => s.UserID === reg.StudentID);
    const pool = pools.find(p => p.PoolID === reg.PoolID);
    
    if (reg.ScheduleID === 'CUSTOM') {
      // Parse custom string: "Giáo viên: Nguyễn Thành Nam | Lịch học: Thứ 2 (18:00), Thứ 3 (18:00)"
      const parts = reg.Notes ? reg.Notes.split(' | ') : [];
      let teacherName = 'Chưa phân công';
      let scheduleStr = 'Chưa có lịch';
      
      if (parts.length >= 2) {
        teacherName = parts[0].replace('Giáo viên: ', '').trim();
        scheduleStr = parts[1].replace('Lịch học: ', '').trim();
      }

      // Split scheduleStr into individual days
      const days = scheduleStr.split(', ');
      days.forEach((dayStr, index) => {
        classes.push({
          id: `${reg.RegistrationID}-custom-${index}`,
          teacherName,
          studentName: student?.FullName || 'Học viên ẩn',
          studentPhone: student?.PhoneNumber || '',
          poolName: pool?.PoolName || 'Hồ bơi ẩn',
          timeStr: dayStr,
          isCustom: true
        });
      });
    } else {
      const schedule = schedules.find(s => s.ScheduleID === reg.ScheduleID);
      if (schedule) {
        const teacher = teachers.find(t => t.UserID === schedule.TeacherID);
        classes.push({
          id: `${reg.RegistrationID}-std`,
          teacherName: teacher?.FullName || 'Chưa phân công',
          studentName: student?.FullName || 'Học viên ẩn',
          studentPhone: student?.PhoneNumber || '',
          poolName: pool?.PoolName || 'Hồ bơi ẩn',
          timeStr: `${schedule.DayOfWeek} (${formatTime(schedule.StartTime)} - ${formatTime(schedule.EndTime)})`,
          isCustom: false
        });
      }
    }
  });

  // Filter based on roles
  const userRoles = user?.Role ? user.Role.split(',').map((r: string) => r.trim()) : [];
  const isAdmin = userRoles.includes('Admin');
  
  let displayClasses = classes;
  if (!isAdmin && userRoles.includes('Teacher')) {
    // Only show classes for this teacher
    displayClasses = classes.filter(c => c.teacherName === user?.FullName);
  }

  if (search) {
    const s = search.toLowerCase();
    displayClasses = displayClasses.filter(c => 
      c.studentName.toLowerCase().includes(s) || 
      c.teacherName.toLowerCase().includes(s) || 
      c.poolName.toLowerCase().includes(s) ||
      c.timeStr.toLowerCase().includes(s)
    );
  }

  // Sort classes by day string roughly
  const dayOrder: any = { 'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 'Thứ 5': 5, 'Thứ 6': 6, 'Thứ 7': 7, 'Chủ nhật': 8 };
  displayClasses.sort((a, b) => {
    const dayA = Object.keys(dayOrder).find(d => a.timeStr.startsWith(d));
    const dayB = Object.keys(dayOrder).find(d => b.timeStr.startsWith(d));
    const valA = dayA ? dayOrder[dayA] : 99;
    const valB = dayB ? dayOrder[dayB] : 99;
    return valA - valB;
  });

  // Lọc lịch hôm nay
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const todayStr = days[new Date().getDay()];
  const todayClasses = displayClasses.filter(c => c.timeStr.startsWith(todayStr));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Lịch dạy học</h1>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Tìm theo tên, hồ bơi, ca học..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-sm shadow-sm text-slate-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {todayClasses.length > 0 && (
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-5 sm:p-6 shadow-md text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl shrink-0">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nhắc nhở lịch dạy hôm nay ({todayStr})</h2>
              <p className="text-sky-100 font-medium text-sm mt-0.5">Bạn có {todayClasses.length} ca dạy trong ngày hôm nay. Hãy chuẩn bị nhé!</p>
            </div>
          </div>
          <button 
            onClick={() => setSearch(todayStr)}
            className="bg-white text-sky-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-sky-50 transition-colors whitespace-nowrap"
          >
            Xem lịch hôm nay
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayClasses.map((cls, idx) => (
          <div key={cls.id || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-sky-50 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-sky-500"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Thời gian</div>
                <div className="font-bold text-slate-800 text-lg">{cls.timeStr}</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Hồ bơi</div>
                  <div className="text-sm font-bold text-slate-700">{cls.poolName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Học viên</div>
                  <div className="text-sm font-bold text-slate-700">{cls.studentName} <span className="text-slate-400 font-normal">({cls.studentPhone})</span></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500">Giáo viên phụ trách</div>
                  <div className="text-sm font-bold text-sky-700">{cls.teacherName}</div>
                </div>
              </div>
            </div>
            
            {/* Điểm danh action - Placeholder for future */}
            <div className="mt-5 flex gap-2">
               <button className="flex-1 bg-sky-50 text-sky-700 font-bold text-sm py-2 rounded-xl hover:bg-sky-100 transition-colors">
                  Điểm danh
               </button>
            </div>
          </div>
        ))}

        {displayClasses.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-sky-50 border-dashed">
            <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium">Chưa có lịch dạy nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
