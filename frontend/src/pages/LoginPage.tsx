import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/authApi';
import { Waves, Lock, User, AlertCircle, Shield, Star, Users, Building2, Loader2 } from 'lucide-react';

// ─── Danh sách 18 tài khoản mẫu ─────────────────────────────────────────────
type AccountGroup = 'admin' | 'lead' | 'specialist' | 'citizen';

interface DemoAccount {
  username: string;
  password: string;
  displayName: string;
  subTitle: string;
  group: AccountGroup;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // Quản trị & Điều phối
  { username: 'admin',           password: 'Admin@123', displayName: 'Quản trị viên HT',         subTitle: 'SuperAdmin',                    group: 'admin',      color: 'rose' },
  { username: 'diepphoi',        password: 'Canbo@123', displayName: 'Trần Thị Mai',              subTitle: 'Tiếp nhận CCTS',               group: 'admin',      color: 'sky' },
  // Trưởng các đơn vị
  { username: 'kiemngu',         password: 'Canbo@123', displayName: 'Lê Hoàng Long',             subTitle: '⭐ Trưởng – Đội TT Kiểm ngư',  group: 'lead',       color: 'amber' },
  { username: 'nuoitrong_lead',  password: 'Canbo@123', displayName: 'Phạm Thị Hoa',             subTitle: '⭐ Trưởng – P. Nuôi trồng TS', group: 'lead',       color: 'amber' },
  { username: 'moitruong_lead',  password: 'Canbo@123', displayName: 'Ngô Quang Minh',           subTitle: '⭐ Trưởng – Đội QL MT Nước',   group: 'lead',       color: 'amber' },
  { username: 'chatluong_lead',  password: 'Canbo@123', displayName: 'Huỳnh Thị Thu',            subTitle: '⭐ Trưởng – Đội QL Chất lượng',group: 'lead',       color: 'amber' },
  { username: 'hatang_lead',     password: 'Canbo@123', displayName: 'Đặng Văn Hùng',            subTitle: '⭐ Trưởng – Đội HT Cảng cá',   group: 'lead',       color: 'amber' },
  // Cán bộ chuyên viên
  { username: 'kiemngu_cb',      password: 'Canbo@123', displayName: 'Nguyễn Văn Thụ',           subTitle: 'CB Kiểm ngư địa bàn',          group: 'specialist', color: 'indigo' },
  { username: 'kiemngu_cb2',     password: 'Canbo@123', displayName: 'Trần Minh Tuấn',           subTitle: 'CB Kiểm ngư tuần tra',         group: 'specialist', color: 'indigo' },
  { username: 'nuoitrong_cb1',   password: 'Canbo@123', displayName: 'Bùi Văn An',               subTitle: 'CB Thụ lý Nuôi trồng 1',       group: 'specialist', color: 'indigo' },
  { username: 'nuoitrong_cb2',   password: 'Canbo@123', displayName: 'Lê Thị Lan',               subTitle: 'CB Thụ lý Nuôi trồng 2',       group: 'specialist', color: 'indigo' },
  { username: 'moitruong_cb1',   password: 'Canbo@123', displayName: 'Trần Thị Ngọc',            subTitle: 'CB Quan trắc Môi trường 1',    group: 'specialist', color: 'indigo' },
  { username: 'moitruong_cb2',   password: 'Canbo@123', displayName: 'Phạm Văn Dũng',            subTitle: 'CB Giám sát Xả thải 2',        group: 'specialist', color: 'indigo' },
  { username: 'chatluong_cb1',   password: 'Canbo@123', displayName: 'Nguyễn Minh Khải',         subTitle: 'CB Kiểm định Chất lượng 1',    group: 'specialist', color: 'indigo' },
  { username: 'chatluong_cb2',   password: 'Canbo@123', displayName: 'Lê Văn Bình',              subTitle: 'CB Kiểm tra Thú y TS 2',       group: 'specialist', color: 'indigo' },
  { username: 'hatang_cb1',      password: 'Canbo@123', displayName: 'Võ Thị Phương',            subTitle: 'CB QL Bến bãi Neo đậu 1',      group: 'specialist', color: 'indigo' },
  { username: 'hatang_cb2',      password: 'Canbo@123', displayName: 'Trần Văn Khánh',           subTitle: 'CB Giám sát Cửa biển 2',       group: 'specialist', color: 'indigo' },
  // Công dân
  { username: 'ngudan',          password: 'Dan@123',   displayName: 'Nguyễn Văn Ngư',           subTitle: 'Hộ nuôi tôm Đất Mũi',         group: 'citizen',    color: 'emerald' },
];

type FilterTab = 'all' | AccountGroup;

const TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all',        label: 'Tất cả',       icon: <Users className="w-3 h-3" /> },
  { key: 'admin',      label: 'Điều phối',    icon: <Shield className="w-3 h-3" /> },
  { key: 'lead',       label: 'Trưởng ĐV',   icon: <Star className="w-3 h-3" /> },
  { key: 'specialist', label: 'Chuyên viên',  icon: <Building2 className="w-3 h-3" /> },
  { key: 'citizen',    label: 'Công dân',     icon: <User className="w-3 h-3" /> },
];

const GROUP_COLORS: Record<AccountGroup, string> = {
  admin:      'bg-rose-100 text-rose-700 border-rose-200',
  lead:       'bg-amber-100 text-amber-700 border-amber-200',
  specialist: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  citizen:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const AVATAR_COLORS: Record<AccountGroup, string> = {
  admin:      'from-rose-500 to-rose-400',
  lead:       'from-amber-500 to-amber-400',
  specialist: 'from-indigo-500 to-indigo-400',
  citizen:    'from-emerald-500 to-emerald-400',
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoadingUser, setQuickLoadingUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Hàm login chung
  const doLogin = async (u: string, p: string) => {
    setError(null);
    try {
      const res = await authApi.login({ usernameOrEmail: u, password: p });
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
    }
  };

  // Submit từ form thủ công
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await doLogin(usernameOrEmail, password);
    setLoading(false);
  };

  // 1-Click Login từ tài khoản mẫu
  const handleDirectLogin = async (account: DemoAccount) => {
    setQuickLoadingUser(account.username);
    setUsernameOrEmail(account.username);
    setPassword(account.password);
    await doLogin(account.username, account.password);
    setQuickLoadingUser(null);
  };

  const filteredAccounts = activeTab === 'all'
    ? DEMO_ACCOUNTS
    : DEMO_ACCOUNTS.filter((a) => a.group === activeTab);

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#006194] to-[#0284c7] p-8 text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Đăng Nhập Hệ Thống</h1>
          <p className="text-xs text-sky-200 mt-1.5 font-medium">
            AquaReflect Gov — Hệ thống Quản lý Phản ánh Ngành Thủy sản Cà Mau
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form đăng nhập thủ công */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="username hoặc email"
                    required
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !!quickLoadingUser}
              className="w-full py-2.5 rounded-xl bg-[#006194] hover:bg-[#005580] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Đăng Nhập</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Hoặc đăng nhập nhanh 1 chạm
              </span>
            </div>
          </div>

          {/* Tab filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#006194] text-white border-[#006194] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`ml-0.5 px-1 rounded-full text-[9px] ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.key === 'all' ? DEMO_ACCOUNTS.length : DEMO_ACCOUNTS.filter(a => a.group === tab.key).length}
                </span>
              </button>
            ))}
          </div>

          {/* Danh sách tài khoản */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredAccounts.map((account) => {
              const isLoading = quickLoadingUser === account.username;
              return (
                <button
                  key={account.username}
                  type="button"
                  disabled={!!quickLoadingUser}
                  onClick={() => handleDirectLogin(account)}
                  className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                    isLoading
                      ? 'border-sky-300 bg-sky-50 scale-[0.98]'
                      : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[account.group]} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}>
                    {isLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : account.displayName.charAt(account.displayName.lastIndexOf(' ') + 1)
                    }
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-[11px] leading-tight truncate">
                      {account.displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                      {account.subTitle}
                    </p>
                    <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0 rounded-full border ${GROUP_COLORS[account.group]}`}>
                      @{account.username}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:underline">
              Đăng ký tài khoản công dân
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
