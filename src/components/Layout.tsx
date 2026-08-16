import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, Home, Calendar, Users, DollarSign, Droplets, List } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) return [];
    
    const userRoles = user.Role ? user.Role.split(',').map((r: string) => r.trim()) : [];
    
    if (userRoles.includes('Admin')) {
      return [
        { name: 'Tổng quan', path: '/', icon: Home },
        { name: 'Hồ bơi', path: '/pools', icon: Droplets },
        { name: 'Người dùng', path: '/users', icon: Users },
        { name: 'Lịch dạy cố định', path: '/schedules', icon: Calendar },
        { name: 'Duyệt đăng ký', path: '/approvals', icon: List },
        { name: 'Học phí', path: '/payments', icon: DollarSign },
        { name: 'Điểm danh', path: '/attendance', icon: Users },
      ];
    } else if (userRoles.includes('Teacher')) {
      return [
        { name: 'Lịch dạy của tôi', path: '/', icon: Calendar },
        { name: 'Tạo lịch dạy', path: '/schedules', icon: Calendar },
        { name: 'Điểm danh', path: '/attendance', icon: Users },
      ];
    } else {
      return [
        { name: 'Đăng ký lịch', path: '/', icon: Calendar },
        { name: 'Lịch của tôi', path: '/my-schedules', icon: List },
        { name: 'Học phí của tôi', path: '/my-payments', icon: DollarSign },
      ];
    }
  };

  const links = getLinks();

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      {/* Sidebar / Bottom Nav for Mobile */}
      <nav className="bg-white border-r border-sky-100 w-full md:w-64 flex flex-col md:h-screen shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-sky-50">
          <div className="h-12 w-auto max-w-[140px] flex items-center justify-center shrink-0 overflow-hidden relative bg-transparent">
            <div className="absolute inset-0 bg-sky-500 rounded-xl flex items-center justify-center text-white aspect-square" id="logo-fallback">
              <Droplets className="w-6 h-6" />
            </div>
            <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain relative z-10" onError={(e) => { 
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('logo-fallback');
              if(fallback) fallback.style.display = 'flex';
            }} onLoad={(e) => {
              const fallback = document.getElementById('logo-fallback');
              if(fallback) fallback.style.display = 'none';
            }} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-sky-900 hidden md:block leading-tight">
            AQUA<br /><span className="text-sky-500">MANAGEMENT</span>
          </h1>
        </div>
        
        <div className="flex-1 p-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 hide-scrollbar space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap font-medium",
                  isActive 
                    ? "bg-sky-50 text-sky-700" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:block text-sm">{link.name}</span>
                {/* For mobile, show icon only or small text */}
                <span className="md:hidden text-xs">{link.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-sky-50 mt-auto hidden md:block">
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
              {user?.FullName.substring(0,2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate">{user?.FullName}</p>
              <p className="text-[10px] text-slate-400">{user?.Role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 w-full px-2 py-2 rounded-lg transition-colors hover:bg-slate-50 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (auth + logout) */}
        <div className="md:hidden flex justify-between items-center bg-white p-3 border-b border-sky-50">
          <div>
            <p className="text-sm font-bold text-slate-800">{user?.FullName}</p>
            <p className="text-xs text-slate-500">{user?.Role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-sky-50 items-center justify-between px-8 shrink-0">
          <h2 className="font-bold text-slate-800 text-xl">Bảng điều khiển</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-sky-700">Trực tuyến</span>
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
