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
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="h-20 w-auto max-w-[200px] flex items-center justify-center shrink-0 overflow-hidden relative bg-transparent mb-4">
          <div className="absolute inset-0 bg-sky-500 rounded-2xl flex items-center justify-center text-white aspect-square mx-auto" id="logo-fallback-login">
            <Droplets className="w-10 h-10" />
          </div>
          <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain relative z-10" onError={(e) => { 
            e.currentTarget.style.display = 'none';
            const fallback = document.getElementById('logo-fallback-login');
            if(fallback) fallback.style.display = 'flex';
          }} onLoad={(e) => {
            const fallback = document.getElementById('logo-fallback-login');
            if(fallback) fallback.style.display = 'none';
          }} />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-sky-900 tracking-tight leading-tight">
          AQUA<br /><span className="text-sky-500">MANAGEMENT</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Hệ thống quản lý trung tâm dạy bơi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-sky-50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700">Họ và tên</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-sky-100 bg-sky-50 text-slate-700 font-medium rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700">Số điện thoại</label>
              <div className="mt-1">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-sky-100 bg-sky-50 text-slate-700 font-medium rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                  placeholder="0912345678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">Mật khẩu</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  title="Mật khẩu phải là 6 chữ số"
                  value={password}
                  onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="appearance-none block w-full px-3 py-2.5 border border-sky-100 bg-sky-50 text-slate-700 font-medium rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                  placeholder="Nhập 6 chữ số"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-sky-600 hover:text-sky-700 font-bold transition-colors"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
