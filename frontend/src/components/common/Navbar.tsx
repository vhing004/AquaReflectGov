import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Waves, 
  Send, 
  Search, 
  MapPin, 
  Shield, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Fish, 
  PhoneCall, 
  AlertTriangle, 
  Globe, 
  FileText
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track?code=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isOfficer = user && (user.role === 'SuperAdmin' || user.role === 'Dispatcher' || user.role === 'Specialist');

  const navLinks = [
    { to: '/', label: 'Trang chủ & Giám sát', icon: Waves },
    { to: '/submit', label: 'Gửi phản ánh', icon: Send },
    { to: '/track', label: 'Tra cứu tiến độ', icon: Search },
    { to: '/categories', label: 'Danh mục thủy sản', icon: Fish },
    { to: '/map', label: 'Bản đồ số & Cảnh báo IUU', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
      {/* 1. TOP NATIONAL GOVERNMENT BAR (Theo chuẩn Stitch Civic Modern) */}
      <div className="bg-[#006194] text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-sky-800/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tracking-wide uppercase font-semibold">
              HỆ THỐNG GIÁM SÁT TÀU CÁ & DỊCH VỤ CÔNG QUỐC GIA — BỘ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sky-100">
            <a href="tel:18001776" className="flex items-center space-x-1 hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-amber-300" />
              <span>Đường dây nóng cứu hộ biển: <strong className="text-white">1800 1776</strong></span>
            </a>
            <span className="hidden md:inline-block text-sky-300">|</span>
            <span className="hidden md:flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Cổng TTĐT: tongcucthuysan.gov.vn</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Quick Search, IUU Alert & User Profile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex justify-between items-center gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#006194] to-[#0284c7] flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#006194]">
                  BỘ NÔNG NGHIỆP & PTNT
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Cục Thủy Sản
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none mt-0.5">
                AquaReflect <span className="text-[#0284c7] font-semibold text-sm">Gov</span>
              </h1>
            </div>
          </Link>

          {/* Quick Search Bar (Desktop) */}
          <form onSubmit={handleQuickSearch} className="hidden xl:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white rounded-xl px-3 py-1.5 border border-slate-200 focus-within:border-[#0284c7] transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#006194] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu mã hồ sơ (#TS-...), số hiệu tàu cá..."
                className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="ml-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#006194] hover:bg-[#0284c7] text-white transition-colors shrink-0"
              >
                Tra cứu
              </button>
            </div>
          </form>

          {/* Alert & User Actions */}
          <div className="flex items-center space-x-3">
            {/* IUU Warning Badge (Live Status) */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Cảnh báo VMS: 03 tàu mất kết nối</span>
            </div>

            {/* Notification Bell Real-time cho Cán bộ */}
            {isAuthenticated && isOfficer && (
              <NotificationBell />
            )}

            {/* Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-sky-400 bg-white shadow-xs hover:shadow transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</p>
                    <p className="text-[10px] text-sky-700 font-medium">{user.roleName}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {user.departmentName && (
                        <p className="text-[10px] text-[#006194] font-semibold mt-1 truncate bg-sky-50 px-2 py-0.5 rounded">
                          {user.departmentName}
                        </p>
                      )}
                    </div>

                    {isOfficer && (
                      <>
                        <Link
                          to="/admin/petitions"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50"
                        >
                          <FileText className="w-4 h-4 text-[#006194]" />
                          <span>Quản Lý Hồ Sơ Nghiệp Vụ</span>
                        </Link>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>Báo Cáo & Điều Phối</span>
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất hệ thống</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#006194] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#006194] hover:bg-[#0284c7] rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                >
                  Đăng ký công dân
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION BAR (Thanh menu tác vụ theo mẫu Stitch) */}
      <nav className="hidden md:block bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 py-1.5 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#006194] hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isOfficer && (
            <div className="flex items-center space-x-1.5 ml-auto shrink-0">
              <Link
                to="/admin/petitions"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  location.pathname === '/admin/petitions'
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#006194]" />
                <span>Hồ Sơ Nghiệp Vụ</span>
              </Link>
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Điều Phối Cán Bộ</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-[#006194] text-white' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isOfficer && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                to="/admin/petitions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-sky-900 bg-sky-50"
              >
                <FileText className="w-4 h-4 text-[#006194]" />
                <span>Quản Lý Hồ Sơ Nghiệp Vụ</span>
              </Link>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Bảng Điều Phối Cán Bộ</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
