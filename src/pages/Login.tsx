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
    <div className="min-h-screen relative flex items-center justify-center font-sans bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Full Screen Background cho cả Mobile và Desktop */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg-login.png" 
          alt="Nguyễn Thành Nam" 
          className="w-full h-full object-cover object-top opacity-80"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Gradient overlay để form và text nổi bật hơn */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/90 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Branding & Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/Logo.png" 
              alt="Logo" 
              className="h-24 w-auto object-contain drop-shadow-xl"
              onError={(e) => { 
                e.currentTarget.style.display = 'none';
              }} 
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Nguyễn Thành Nam
          </h2>
          <p className="mt-2 text-sky-400 font-bold drop-shadow-md text-lg">
            Cựu vận động viên quốc gia
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/20">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {isLogin ? 'Chào mừng bạn quay trở lại hệ thống' : 'Điền thông tin để đăng ký học bơi'}
            </p>
          </div>

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
  );
}
