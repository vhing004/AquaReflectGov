import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { masterDataApi } from '../../api/masterDataApi';
import type { AdminPetitionItem, AllowedTransition, Department } from '../../types';
import {
  X,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  AlertTriangle,
  Send,
  Building2,
  FileText,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

interface TransitionStatusModalProps {
  petition: AdminPetitionItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const TransitionStatusModal: React.FC<TransitionStatusModalProps> = ({
  petition,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [resolutionSummary, setResolutionSummary] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch allowed transitions from backend for this petition
  const {
    data: allowedRes,
    isLoading: isLoadingTransitions,
  } = useQuery({
    queryKey: ['allowedTransitions', petition.id],
    queryFn: () => adminApi.getAllowedTransitions(petition.id),
    enabled: isOpen,
  });

  // Fetch departments list
  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
    staleTime: 1000 * 60 * 10,
    enabled: isOpen,
  });

  const allowedTransitions = allowedRes?.data || [];
  const departments: Department[] = deptsRes?.data || [];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(null);
      setDepartmentId(petition.departmentName ? '' : '');
      setResolutionSummary('');
      setNote('');
      setErrorMessage(null);
    }
  }, [isOpen, petition]);

  // Auto-select first allowed transition if available
  useEffect(() => {
    if (allowedTransitions.length > 0 && selectedStatus === null) {
      setSelectedStatus(allowedTransitions[0].status);
    }
  }, [allowedTransitions, selectedStatus]);

  if (!isOpen) return null;

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2:
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 3:
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 4:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 5:
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 6:
        return <Check className="w-4 h-4 text-slate-600" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getCardColor = (status: number, isSelected: boolean) => {
    if (!isSelected) {
      return 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700';
    }

    switch (status) {
      case 2:
        return 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200 text-indigo-950';
      case 3:
        return 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200 text-amber-950';
      case 4:
        return 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200 text-emerald-950';
      case 5:
        return 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200 text-rose-950';
      case 6:
        return 'border-slate-500 bg-slate-100 ring-2 ring-slate-300 text-slate-900';
      default:
        return 'border-sky-500 bg-sky-50 text-sky-900';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setErrorMessage('Vui lòng chọn trạng thái tiếp theo.');
      return;
    }

    // Validation
    if (selectedStatus === 2 && !departmentId) {
      setErrorMessage('Vui lòng chọn Phòng ban / Cơ quan chuyên môn thụ lý hồ sơ.');
      return;
    }

    if (selectedStatus === 5 && !note.trim()) {
      setErrorMessage('Vui lòng nêu rõ lý do từ chối tiếp nhận hồ sơ.');
      return;
    }

    if (selectedStatus === 4 && !resolutionSummary.trim()) {
      setErrorMessage('Vui lòng nhập tóm tắt kết luận và biện pháp giải quyết.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminApi.transitionStatus(petition.id, {
        toStatus: selectedStatus,
        departmentId: departmentId || undefined,
        resolutionSummary: resolutionSummary.trim() || undefined,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess(res.message || 'Cập nhật trạng thái thành công!');
        onClose();
      } else {
        setErrorMessage(res.message || 'Không thể cập nhật trạng thái.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosErr?.response?.data?.message || 'Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006194] to-[#0284c7] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
                {petition.trackingCode}
              </span>
              <span className="text-xs text-sky-100">
                • Trạng thái hiện tại: <strong>{petition.statusName}</strong>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug line-clamp-1">
              Luân chuyển trạng thái & Xử lý hồ sơ
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs text-slate-700">
          {/* Petition Mini Context */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <p className="font-bold text-slate-900 line-clamp-1">{petition.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span>Lĩnh vực: <strong className="text-slate-700">{petition.categoryName}</strong></span>
              <span>•</span>
              <span>
                Đơn vị hiện tại:{' '}
                <strong className="text-slate-700">
                  {petition.departmentName || 'Chưa phân công'}
                </strong>
              </span>
            </div>
          </div>

          {/* Next Allowed Status Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Chọn bước xử lý tiếp theo theo quy trình
            </label>

            {isLoadingTransitions ? (
              <div className="py-4 text-center text-slate-400 animate-pulse">
                Đang tải các bước xử lý hợp lệ...
              </div>
            ) : allowedTransitions.length === 0 ? (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Hồ sơ hiện không có bước chuyển trạng thái nào được phép với vai trò của bạn hoặc hồ sơ đã kết thúc.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allowedTransitions.map((trans: AllowedTransition) => {
                  const isSelected = selectedStatus === trans.status;
                  return (
                    <button
                      key={trans.status}
                      type="button"
                      onClick={() => setSelectedStatus(trans.status)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start space-x-2.5 cursor-pointer ${getCardColor(
                        trans.status,
                        isSelected
                      )}`}
                    >
                      <div className="mt-0.5 shrink-0">{getStatusIcon(trans.status)}</div>
                      <div>
                        <div className="font-bold text-xs leading-tight">{trans.statusName}</div>
                        <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                          {trans.actionDescription}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Input 1: Department Selection (if Assigned) */}
          {selectedStatus === 2 && (
            <div className="space-y-1.5 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Phòng ban / Cơ quan chuyên môn thụ lý <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium text-slate-800"
                >
                  <option value="">-- Chọn cơ quan thụ lý --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-indigo-700">
                Hồ sơ sẽ được chuyển trực tiếp vào danh sách việc cần xử lý của phòng ban được chọn.
              </p>
            </div>
          )}

          {/* Dynamic Input 2: Resolution Summary (if Resolved) */}
          {selectedStatus === 4 && (
            <div className="space-y-1.5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tóm tắt kết luận & Biện pháp giải quyết</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Nhập chi tiết kết quả xử lý, căn cứ pháp lý, biện pháp khắc phục hoặc quyết định xử lý vi phạm..."
                rows={4}
                required
                className="w-full p-3 text-xs rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 text-slate-800 leading-relaxed"
              ></textarea>
              <p className="text-[10px] text-emerald-700">
                Nội dung kết luận này sẽ được công khai hiển thị trên trang tra cứu để công dân/ngư dân theo dõi và thực hiện đánh giá hài lòng.
              </p>
            </div>
          )}

          {/* Dynamic Input 3: Reason / Note */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {selectedStatus === 5 ? (
                  <>
                    Lý do từ chối thụ lý <span className="text-rose-500">*</span>
                  </>
                ) : (
                  'Ghi chú nội bộ / Kế hoạch triển khai'
                )}
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                selectedStatus === 5
                  ? 'Ví dụ: Đơn phản ánh không thuộc phạm vi quản lý của Sở NN&PTNT hoặc địa bàn ngoài tỉnh...'
                  : 'Ghi chú nghiệp vụ lưu vết vào nhật ký luân chuyển hồ sơ...'
              }
              rows={2}
              required={selectedStatus === 5}
              className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                selectedStatus === 5
                  ? 'border-rose-200 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-sky-100 bg-slate-50/50 focus:bg-white'
              }`}
            ></textarea>
          </div>

          {/* Warning for Critical Actions */}
          {(selectedStatus === 5 || selectedStatus === 6) && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2 text-[11px] text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý nghiệp vụ:</strong>{' '}
                {selectedStatus === 5
                  ? 'Hồ sơ từ chối sẽ dừng quá trình thụ lý và gửi thông báo lý do chính thức tới công dân.'
                  : 'Hồ sơ đóng sẽ được đưa vào lưu trữ vĩnh viễn và không thể chuyển đổi trạng thái tiếp theo.'}
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs animate-in shake">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || allowedTransitions.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#0284c7] text-white transition-all flex items-center space-x-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Đang cập nhật...' : 'Xác nhận chuyển trạng thái'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
