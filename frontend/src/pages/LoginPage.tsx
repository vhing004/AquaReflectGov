import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/authApi';
import { Waves, LogIn, Lock, User, AlertCircle, Shield, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ usernameOrEmail, password });
      if (res.success && res.data) {
        setAuth(res.data);
        if (res.data.user.role === 'Citizen') {
          navigate('/');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(res.message || 'Đăng nhập không thành công.');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        setError(axErr.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      } else {
        setError('Đã xảy ra lỗi kết nối máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Nhập Hệ Thống</h2>
          <p className="text-xs text-slate-500 font-medium">
            Dành cho cán bộ Chi cục Thủy sản và người dân / tổ chức nuôi trồng
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tên đăng nhập hoặc Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin, diepphoi hoặc ngudan"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
              <a href="#forgot" className="text-xs font-semibold text-sky-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Tài Khoản Mẫu Trải Nghiệm Nhanh
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Admin@123')}
              className="p-2 text-left rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
            >
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <Shield className="w-3 h-3 text-rose-500" />
                <span>SuperAdmin</span>
              </p>
              <p className="text-[10px] text-slate-500">admin / Admin@123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('diepphoi', 'Canbo@123')}
              className="p-2 text-left rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
            >
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <Check className="w-3 h-3 text-sky-500" />
                <span>Tiếp Nhận CCTS</span>
              </p>
              <p className="text-[10px] text-slate-500">diepphoi / Canbo@123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('kiemngu', 'Canbo@123')}
              className="p-2 text-left rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
            >
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <Shield className="w-3 h-3 text-amber-500" />
                <span>Thanh Tra Kiểm Ngư</span>
              </p>
              <p className="text-[10px] text-slate-500">kiemngu / Canbo@123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('ngudan', 'Dan@123')}
              className="p-2 text-left rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
            >
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <User className="w-3 h-3 text-emerald-500" />
                <span>Ngư Dân Đất Mũi</span>
              </p>
              <p className="text-[10px] text-slate-500">ngudan / Dan@123</p>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:underline">
            Đăng ký tài khoản công dân
          </Link>
        </p>
      </div>
    </div>
  );
};
