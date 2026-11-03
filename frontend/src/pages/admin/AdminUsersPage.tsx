import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, Plus, Edit2, Lock, Unlock, Building2,
  Shield, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Crown, UserCheck, FileText, RotateCcw,
} from 'lucide-react';
import { usersApi } from '../../api/usersApi';
import { masterDataApi } from '../../api/masterDataApi';
import { OfficerPetitionsDrawer } from '../../components/admin/OfficerPetitionsDrawer';
import { UserFormModal } from '../../components/admin/UserFormModal';
import type { UserListItem } from '../../types';

// Badge vai trò
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, { label: string; cls: string }> = {
    SuperAdmin: { label: 'Quản trị viên', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
    Dispatcher: { label: 'Tiếp nhận / Điều phối', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    Specialist: { label: 'Cán bộ thụ lý', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
    Citizen: { label: 'Công dân', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  };
  const { label, cls } = map[role] ?? { label: role, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
};

// Avatar chữ cái
const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-9 h-9' }) => {
  const initials = name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
  const colors = [
    'from-[#006194] to-[#0284c7]', 'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div className={`${size} rounded-xl bg-gradient-to-tr ${colors[idx]} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs`}>
      {initials}
    </div>
  );
};

// Toast thông báo nổi
const InlineToast: React.FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => (
  <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in">
    <CheckCircle2 className="w-4 h-4 shrink-0" />
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 hover:text-emerald-200 cursor-pointer">
      <XCircle className="w-4 h-4" />
    </button>
  </div>
);

export const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();

  // State bộ lọc
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | ''>('');
  const [deptFilter, setDeptFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [page, setPage] = useState(1);

  // State modal & drawer
  const [drawerUser, setDrawerUser] = useState<UserListItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Lấy danh sách người dùng
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', keyword, roleFilter, deptFilter, activeFilter, page],
    queryFn: async () => {
      const params: any = { pageNumber: page, pageSize: 15 };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (roleFilter !== '') params.role = roleFilter;
      if (deptFilter) params.departmentId = deptFilter;
      if (activeFilter !== '') params.isActive = activeFilter;
      const res = await usersApi.getUsers(params);
      return res.data;
    },
  });

  // Lấy danh sách phòng ban để lọc
  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
  });

  const users: UserListItem[] = (data as any)?.data?.items ?? [];
  const totalCount: number = (data as any)?.data?.totalCount ?? 0;
  const totalPages: number = (data as any)?.data?.totalPages ?? 1;
  const departments = deptData?.data ?? [];

  // Khóa / Mở khóa tài khoản
  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setToastMsg('Cập nhật trạng thái tài khoản thành công!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái tài khoản.');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (u: UserListItem, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setEditingUser(u);
    setFormOpen(true);
  };

  const handleToggle = (u: UserListItem, ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn ${u.isActive ? 'KHÓA' : 'MỞ KHÓA'} tài khoản "${u.fullName}"?`)) {
      toggleMutation.mutate(u.id);
    }
  };

  const handleRowClick = (u: UserListItem) => {
    if (u.role === 'Specialist') {
      setDrawerUser(u);
    }
  };

  const onFormSuccess = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast thông báo */}
      {toastMsg && <InlineToast msg={toastMsg} onClose={() => setToastMsg('')} />}

      {/* Header trang */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006194] to-[#0284c7] flex items-center justify-center shadow-md shadow-sky-500/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quản lý người dùng hệ thống</h1>
                <p className="text-sm text-slate-500">Toàn quyền xem, phân quyền, phân công và kiểm tra cán bộ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                title="Tải lại danh sách"
              >
                <RotateCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm tài khoản
              </button>
            </div>
          </div>

          {/* Hộp thống kê tổng quan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tổng tài khoản', value: totalCount, icon: Users, color: 'text-[#006194]', bg: 'bg-sky-50' },
              { label: 'Cán bộ thụ lý (Trang này)', value: users.filter((u) => u.role === 'Specialist').length, icon: UserCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Cán bộ tiếp nhận (Trang này)', value: users.filter((u) => u.role === 'Dispatcher').length, icon: Shield, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Tài khoản bị khóa', value: users.filter((u) => !u.isActive).length, icon: Lock, color: 'text-red-700', bg: 'bg-red-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 border border-slate-100`}>
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Thanh công cụ lọc */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap gap-3 items-center mb-6 shadow-xs">
          {/* Tìm kiếm từ khóa */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, username, email, SĐT..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194] transition-colors"
            />
          </div>

          {/* Lọc theo vai trò */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194] transition-colors"
          >
            <option value="">Tất cả vai trò</option>
            <option value="1">Quản trị viên (SuperAdmin)</option>
            <option value="2">Cán bộ Tiếp nhận (Dispatcher)</option>
            <option value="3">Cán bộ Thụ lý (Specialist)</option>
            <option value="4">Công dân (Citizen)</option>
          </select>

          {/* Lọc theo phòng ban */}
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194] transition-colors max-w-[220px]"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Lọc theo trạng thái */}
          <select
            value={activeFilter === '' ? '' : String(activeFilter)}
            onChange={(e) => {
              if (e.target.value === '') setActiveFilter('');
              else setActiveFilter(e.target.value === 'true');
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/20 focus:border-[#006194] transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Đã bị khóa</option>
          </select>
        </form>

        {/* Bảng dữ liệu người dùng */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-slate-100 p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">Không thể tải danh sách người dùng</h3>
              <p className="text-sm text-slate-500 max-w-md mb-4">
                {errorMessage || 'Lỗi kết nối máy chủ hoặc tài khoản hiện tại không có quyền SuperAdmin.'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-sm font-semibold transition-colors"
              >
                Thử kết nối lại
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-semibold text-slate-700">Không tìm thấy người dùng phù hợp</p>
              <p className="text-sm text-slate-500 mt-1">Vui lòng thay đổi tiêu chí bộ lọc hoặc nhấn nút Thêm tài khoản</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-3.5">Người dùng / Cán bộ</th>
                      <th className="px-4 py-3.5 hidden md:table-cell">Vai trò & Phòng ban</th>
                      <th className="px-4 py-3.5 text-center hidden lg:table-cell">Tải công việc</th>
                      <th className="px-4 py-3.5 text-center">Trạng thái</th>
                      <th className="px-4 py-3.5 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => handleRowClick(u)}
                        className={`group transition-colors ${
                          u.role === 'Specialist' ? 'cursor-pointer hover:bg-sky-50/60' : 'hover:bg-slate-50'
                        } ${!u.isActive ? 'opacity-60 bg-slate-50/50' : ''}`}
                      >
                        {/* Cột 1: Thông tin người dùng */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar name={u.fullName} />
                              {u.isUnitLead && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center shadow-xs" title="Trưởng/Phó đơn vị">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 group-hover:text-[#006194] transition-colors truncate">
                                {u.fullName}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">@{u.username}</div>
                              <div className="text-xs text-slate-400 truncate">{u.email}</div>
                              {u.phoneNumber && <div className="text-xs text-slate-400">{u.phoneNumber}</div>}
                            </div>
                            {u.role === 'Specialist' && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#006194] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 ml-2 shrink-0">
                                <FileText className="w-3 h-3" /> Xem hồ sơ
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 2: Vai trò & Đơn vị */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <RoleBadge role={u.role} />
                            {u.departmentName ? (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[200px]">{u.departmentName}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">Chưa gán đơn vị</div>
                            )}
                          </div>
                        </td>

                        {/* Cột 3: Tải công việc */}
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          {u.role === 'Specialist' ? (
                            <div className="space-y-0.5 text-xs">
                              <div className="text-amber-700 font-semibold">{u.activeCaseCount} đang thụ lý</div>
                              <div className="text-emerald-700 font-medium">{u.resolvedCaseCount} đã xử lý</div>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Cột 4: Trạng thái */}
                        <td className="px-4 py-4 text-center">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3" /> Đã khóa
                            </span>
                          )}
                        </td>

                        {/* Cột 5: Thao tác */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(ev) => handleOpenEdit(u, ev)}
                              className="w-8 h-8 rounded-lg border border-slate-200 hover:border-[#006194] hover:bg-sky-50 text-slate-500 hover:text-[#006194] flex items-center justify-center transition-all cursor-pointer"
                              title="Chỉnh sửa tài khoản"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(ev) => handleToggle(u, ev)}
                              disabled={toggleMutation.isPending}
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                u.isActive
                                  ? 'border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-600'
                                  : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                              }`}
                              title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Hiển thị {((page - 1) * 15) + 1}–{Math.min(page * 15, totalCount)} trên tổng số {totalCount} người dùng
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600 font-medium px-2">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer xem hồ sơ phản ánh của Cán bộ thụ lý */}
      <OfficerPetitionsDrawer
        isOpen={!!drawerUser}
        onClose={() => setDrawerUser(null)}
        user={drawerUser}
      />

      {/* Modal tạo mới hoặc chỉnh sửa người dùng */}
      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={onFormSuccess}
        editUser={editingUser}
      />
    </div>
  );
};
