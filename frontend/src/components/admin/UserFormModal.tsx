// Modal tạo/sửa tài khoản Admin / Điều phối viên / Công dân
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Mail, Phone, Lock, Building2, Shield, Eye, EyeOff } from 'lucide-react';
import { usersApi } from '../../api/usersApi';
import { masterDataApi } from '../../api/masterDataApi';
import type { UserListItem, CreateUserRequest, UpdateUserRequest } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  editUser?: UserListItem | null;
}

const ROLE_OPTIONS = [
  { value: 1, label: 'Super Admin' },
  { value: 2, label: 'Can bo tiep nhan' },
  { value: 3, label: 'Can bo thu ly' },
  { value: 4, label: 'Cong dan' },
];

const ROLE_NAME_MAP: Record<string, number> = {
  SuperAdmin: 1,
  Dispatcher: 2,
  Specialist: 3,
  Citizen: 4,
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editUser,
}) => {
  const qc = useQueryClient();
  const isEdit = !!editUser;
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 3,
    departmentId: '',
    isUnitLead: false,
    newPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load du lieu vao form khi sua
  useEffect(() => {
    if (isEdit && editUser) {
      setForm({
        username: editUser.username,
        password: '',
        fullName: editUser.fullName,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber ?? '',
        role: ROLE_NAME_MAP[editUser.role] ?? 3,
        departmentId: editUser.departmentId ?? '',
        isUnitLead: editUser.isUnitLead,
        newPassword: '',
      });
    } else {
      setForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 3,
        departmentId: '',
        isUnitLead: false,
        newPassword: '',
      });
    }
    setErrors({});
  }, [editUser, isEdit, isOpen]);

  // Lay danh sach phong ban
  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
    enabled: isOpen,
  });
  const departments = deptData?.data ?? [];

  // Mutation tao moi
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserRequest) => usersApi.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess('Tao tai khoan thanh cong!');
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Co loi xay ra, vui long thu lai';
      setErrors({ general: msg });
    },
  });

  // Mutation cap nhat
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserRequest) => usersApi.updateUser(editUser!.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess('Cap nhat thanh cong!');
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Co loi xay ra, vui long thu lai';
      setErrors({ general: msg });
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isSpecialist = form.role === 3;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isEdit && !form.username.trim()) e.username = 'Bat buoc nhap ten dang nhap';
    if (!isEdit && !form.password.trim()) e.password = 'Bat buoc nhap mat khau';
    if (!form.fullName.trim()) e.fullName = 'Bat buoc nhap ho ten';
    if (!isEdit && !form.email.trim()) e.email = 'Bat buoc nhap email';
    if (!isEdit && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email khong hop le';
    if (isSpecialist && !form.departmentId) e.departmentId = 'Can bo thu ly phai thuoc phong ban';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (isEdit) {
      const payload: UpdateUserRequest = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
        departmentId: isSpecialist ? (form.departmentId || undefined) : undefined,
        isUnitLead: isSpecialist ? form.isUnitLead : false,
        newPassword: form.newPassword || undefined,
      };
      updateMutation.mutate(payload);
    } else {
      const payload: CreateUserRequest = {
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
        departmentId: isSpecialist ? (form.departmentId || undefined) : undefined,
        isUnitLead: isSpecialist ? form.isUnitLead : false,
      };
      createMutation.mutate(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006194] to-[#0284c7] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEdit ? 'Chinh sua nguoi dung' : 'Tao tai khoan moi'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? `Dang sua: ${editUser?.username}` : 'Dien day du thong tin phia duoi'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* Username (chi tao moi) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ten dang nhap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors ${errors.username ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  placeholder="vd: nguyenvana"
                />
              </div>
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
            </div>
          )}

          {/* Ho ten */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ho va ten <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                placeholder="vd: Nguyen Van A"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email (chi tao moi) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  placeholder="vd: nguyenvana@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
          )}

          {/* So dien thoai */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">So dien thoai</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors"
                placeholder="vd: 0912345678"
              />
            </div>
          </div>

          {/* Vai tro */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vai tro <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: Number(e.target.value), departmentId: '', isUnitLead: false })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors appearance-none"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phong ban (chi hien khi la Specialist) */}
          {isSpecialist && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phong ban <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors appearance-none ${errors.departmentId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <option value="">-- Chon phong ban --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {errors.departmentId && <p className="text-xs text-red-600 mt-1">{errors.departmentId}</p>}

              {/* La truong don vi */}
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isUnitLead}
                  onChange={(e) => setForm({ ...form, isUnitLead: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#006194]"
                />
                <span className="text-sm text-slate-700">La truong/pho don vi</span>
              </label>
            </div>
          )}

          {/* Mat khau */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isEdit ? 'Mat khau moi (bo trong de giu nguyen)' : <>Mat khau <span className="text-red-500">*</span></>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={isEdit ? form.newPassword : form.password}
                onChange={(e) => isEdit
                  ? setForm({ ...form, newPassword: e.target.value })
                  : setForm({ ...form, password: e.target.value })
                }
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                placeholder={isEdit ? 'Nhap mat khau moi de thay doi' : 'Toi thieu 8 ky tu'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Huy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#006194] hover:bg-[#004d77] text-white transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Dang xu ly...</>
            ) : (
              isEdit ? 'Luu thay doi' : 'Tao tai khoan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

