import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fetchApi } from '../lib/api';
import { Droplets, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone, password })
        });
        login(res.token, res.user);
        navigate('/');
      } else {
        const res = await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ phone, password, fullName })
        });
        login(res.token, res.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Cột trái: Hình nền anh Nam (chỉ hiển thị trên màn hình lớn) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Lớp màu gradient overlay để làm tối bớt hình nền và làm nổi bật text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
        <img 
          src="/bg-login.png" 
          alt="Nguyễn Thành Nam" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          onError={(e) => {
            // Nếu chưa upload ảnh bg-login.png, hiển thị màu nền mặc định
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Nguyễn Thành Nam
            </h2>
          </div>
          <p className="text-lg text-sky-400 font-bold max-w-md drop-shadow-md mb-2">
            Cựu vận động viên quốc gia
          </p>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        {/* Background mờ cho mobile khi không có cột trái */}
        <div className="absolute inset-0 lg:hidden opacity-5 z-0">
          <img src="/bg-login.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-[400px] z-10">
          <div className="text-center lg:text-left mb-10">
            {/* Logo ở form đăng nhập */}
            <div className="h-20 w-auto flex items-center justify-center lg:justify-start shrink-0 overflow-hidden relative bg-transparent mb-8">
              <div className="absolute inset-0 lg:inset-auto lg:left-0 lg:right-auto bg-sky-500 rounded-2xl flex items-center justify-center text-white w-20 h-20" id="logo-fallback-login">
                <Droplets className="w-10 h-10" />
              </div>
              <img src="/Logo.png" alt="Logo" className="h-full w-auto object-contain relative z-10" onError={(e) => { 
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback-login');
                if(fallback) fallback.style.display = 'flex';
              }} onLoad={(e) => {
                const fallback = document.getElementById('logo-fallback-login');
                if(fallback) fallback.style.display = 'none';
              }} />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {isLogin ? 'Chào mừng bạn quay trở lại hệ thống' : 'Điền thông tin để đăng ký học bơi'}
            </p>
            
            <div className="mt-6 lg:hidden">
              <h3 className="text-2xl font-bold text-sky-700">Nguyễn Thành Nam</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Hệ thống quản lý dạy bơi</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm lg:bg-transparent py-8 px-4 shadow-xl shadow-slate-200/40 lg:shadow-none sm:rounded-2xl lg:rounded-none sm:px-10 lg:px-0 border border-slate-100 lg:border-none">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-900 font-medium rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-900 font-medium rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  title="Mật khẩu phải là 6 chữ số"
                  value={password}
                  onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-900 font-medium rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Nhập 6 chữ số"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start">
                  <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Đăng nhập' : 'Đăng ký ngay')}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm text-slate-500 hover:text-sky-600 font-bold transition-colors"
              >
                {isLogin ? 'Chưa có tài khoản? Đăng ký tại đây' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
