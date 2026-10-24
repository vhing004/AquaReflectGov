import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Users, 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { DepartmentOfficer } from '../../types';

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  petitionId: string;
  trackingCode: string;
  departmentId?: string;
  departmentName?: string;
  currentAssignedUserId?: string;
  onSuccess: (assignedUserName: string) => void;
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  petitionId,
  trackingCode,
  departmentId,
  departmentName,
  currentAssignedUserId,
  onSuccess,
}) => {
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssignedUserId || '');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && departmentId) {
      loadOfficers(departmentId);
      setSelectedUserId(currentAssignedUserId || '');
      setNote('');
      setErrorMessage(null);
    }
  }, [isOpen, departmentId, currentAssignedUserId]);

  const loadOfficers = async (deptId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getDepartmentOfficers(deptId);
      if (res.success && res.data) {
        setOfficers(res.data);
        // Tự động chọn cán bộ khuyến nghị nếu chưa có người thụ lý
        if (!currentAssignedUserId) {
          const recommended = res.data.find(o => o.isRecommended && !o.isUnitLead) || res.data[0];
          if (recommended) {
            setSelectedUserId(recommended.id);
          }
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || 'Không thể tải danh sách cán bộ đơn vị.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMessage('Vui lòng chọn cán bộ để phân công.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.assignMember(petitionId, {
        assignedUserId: selectedUserId,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess(res.data.assignedUserName);
        onClose();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || 'Lỗi phân công cán bộ thụ lý.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Lấy màu hash ngẫu nhiên nhưng cố định cho avatar
  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Phân Công Cán Bộ Thụ Lý</h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Hồ sơ: <span className="font-mono font-medium text-white">{trackingCode}</span> • Đơn vị: {departmentName || 'Chuyên môn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Chọn thành viên trong đơn vị ({officers.length})
              </label>
              <span className="text-xs text-slate-500">Ưu tiên cán bộ có tải công việc thấp</span>
            </div>

            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-sm">Đang tải danh sách thành viên...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Không tìm thấy cán bộ nào thuộc đơn vị này.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {officers.map((officer) => {
                  const isSelected = selectedUserId === officer.id;
                  const isCurrent = currentAssignedUserId === officer.id;

                  return (
                    <div
                      key={officer.id}
                      onClick={() => setSelectedUserId(officer.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarBg(officer.fullName)} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          {getInitials(officer.fullName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800">
                              {officer.fullName}
                            </span>
                            {officer.isUnitLead && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                Trưởng đơn vị
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700">
                                Đang phụ trách
                              </span>
                            )}
                            {officer.isRecommended && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> Gợi ý
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            @{officer.username} {officer.phoneNumber ? `• ${officer.phoneNumber}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            officer.workloadLevel === 'Low'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : officer.workloadLevel === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <Briefcase className="w-3 h-3" />
                            {officer.activeCaseCount} đơn đang xử lý
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Chỉ đạo / Ghi chú giao việc (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Đề nghị đồng chí phối hợp kiểm tra hiện trường ao nuôi và báo cáo trước ngày 26/10..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân công...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Xác nhận phân công
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
