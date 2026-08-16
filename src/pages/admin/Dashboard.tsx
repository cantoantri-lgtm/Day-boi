import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Users, List, Droplets, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/stats').then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Học viên tích cực</p>
          <h3 className="text-3xl font-light text-slate-800 mt-1">{stats?.students || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Đăng ký chờ duyệt</p>
          <h3 className="text-3xl font-light text-orange-500 mt-1">{stats?.pending || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Doanh thu tháng này</p>
          <h3 className="text-3xl font-light text-slate-800 mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.revenue || 0)}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Hồ bơi hoạt động</p>
          <h3 className="text-3xl font-light text-slate-800 mt-1">{stats?.activePools || 0}</h3>
        </div>
      </div>
    </div>
  );
}
