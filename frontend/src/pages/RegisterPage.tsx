import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/authApi';
import { Waves, UserPlus, Lock, User, Mail, Phone, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register(formData);
      if (res.success && res.data) {
        setAuth(res.data);
        navigate('/');
      } else {
        setError(res.message || 'Đăng ký không thành công.');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        setError(axErr.response?.data?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      } else {
        setError('Đã xảy ra lỗi kết nối máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Ký Tài Khoản Công Dân</h2>
          <p className="text-xs text-slate-500 font-medium">
            Dành cho ngư dân, chủ tàu cá, hộ nuôi trồng và doanh nghiệp thủy sản
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nguyenvanan"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên đầy đủ</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn An"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="an.nguyen@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>
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
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-sky-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
