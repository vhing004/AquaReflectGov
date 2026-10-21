import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  FileCheck2,
  Eye,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { PetitionResolution } from '../../types';

interface ReviewResolutionModalProps {
  petitionId: string;
  trackingCode: string;
  isOpen: boolean;
  initialMode?: 'close' | 'rework';
  onClose: () => void;
  onSuccess: (message: string) => void;
  resolution?: PetitionResolution;
  conclusionTypeName?: string;
  publicSummary?: string;
}

export const ReviewResolutionModal: React.FC<ReviewResolutionModalProps> = ({
  petitionId,
  trackingCode,
  isOpen,
  initialMode = 'close',
  onClose,
  onSuccess,
  resolution,
  conclusionTypeName,
  publicSummary,
}) => {
  const [mode, setMode] = useState<'close' | 'rework'>(initialMode);
  const [approvalNote, setApprovalNote] = useState('');
  const [reworkReason, setReworkReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setApprovalNote('');
      setReworkReason('');
      setErrorMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'rework') {
      const cleanReason = reworkReason.trim();
      if (!cleanReason) {
        setErrorMessage('Vui lòng nhập lý do cụ thể khi yêu cầu chuyên viên xử lý lại.');
        return;
      }
      if (cleanReason.length < 10) {
        setErrorMessage('Lý do trả về phải có tối thiểu 10 ký tự để chuyên viên nắm rõ nội dung cần khắc phục.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await adminApi.transitionStatus(petitionId, {
          toStatus: 3, // Investigating
          note: cleanReason,
        });

        onSuccess(res.message || 'Đã chuyển hồ sơ về trạng thái Đang thẩm tra để xử lý lại thành công.');
        onClose();
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setErrorMessage(axiosError?.response?.data?.message || 'Không thể gửi yêu cầu xử lý lại. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // mode === 'close'
      try {
        setIsSubmitting(true);
        const res = await adminApi.transitionStatus(petitionId, {
          toStatus: 6, // Closed
          note: approvalNote.trim() || 'Điều phối viên đã kiểm duyệt và phê duyệt kết quả giải quyết.',
        });

        onSuccess(res.message || 'Đã phê duyệt và đóng hồ sơ thành công. Hệ thống đã kích hoạt cổng đánh giá CSAT.');
        onClose();
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setErrorMessage(axiosError?.response?.data?.message || 'Không thể phê duyệt đóng hồ sơ. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 text-white transition-colors duration-300 ${
          mode === 'close' 
            ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800' 
            : 'bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs shadow-inner">
                {mode === 'close' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                ) : (
                  <RotateCcw className="w-6 h-6 text-amber-200" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-snug">
                  {mode === 'close' ? 'Kiểm Duyệt & Đóng Hồ Sơ' : 'Yêu Cầu Chuyên Viên Xử Lý Lại'}
                </h3>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  Mã hồ sơ: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{trackingCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-2xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setMode('close');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'close'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Phê duyệt đóng đơn</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('rework');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'rework'
                  ? 'bg-white text-amber-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Yêu cầu xử lý lại</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-start space-x-2.5 animate-in shake">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Dossier Resolution Snapshot */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-[#006194]" />
                <span>Kết luận đang chờ duyệt:</span>
              </span>
              {conclusionTypeName && (
                <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px]">
                  {conclusionTypeName}
                </span>
              )}
            </div>

            {resolution && (
              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                {resolution.conclusionText}
              </p>
            )}

            {publicSummary && (
              <div className="pt-1 flex items-start space-x-2 text-xs text-sky-900 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100">
                <Eye className="w-3.5 h-3.5 text-[#006194] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Tóm tắt công khai:</strong> {publicSummary}
                </span>
              </div>
            )}
          </div>

          {/* Mode-Specific Content */}
          {mode === 'close' ? (
            <div className="space-y-3">
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Xác nhận đóng hồ sơ và gửi thông báo hoàn tất:</span>
                </p>
                <p className="text-slate-600 leading-relaxed pl-5">
                  Sau khi đóng, hồ sơ sẽ chuyển sang trạng thái <strong>Đã đóng (Closed)</strong>. Người dân sẽ nhận được email thông báo hoàn thành kèm liên kết đánh giá mức độ hài lòng (CSAT) trong vòng 14 ngày.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi chú phê duyệt của Điều phối viên (Không bắt buộc):
                </label>
                <textarea
                  rows={3}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Ví dụ: Đã nghiệm thu kết quả hiện trường, chất lượng giải quyết đạt yêu cầu..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Cảnh báo chuyển ngược trạng thái (Rework):</span>
                </p>
                <p className="text-amber-900/90 leading-relaxed pl-5">
                  Hồ sơ sẽ được chuyển ngược về <strong>Đang thẩm tra (Investigating)</strong>. Số lần yêu cầu xử lý lại sẽ được ghi nhận và gửi thông báo trực tiếp đến Chuyên viên thụ lý.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Lý do yêu cầu xử lý lại <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-semibold ${reworkReason.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {reworkReason.trim().length}/10 ký tự tối thiểu
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  placeholder="Nêu rõ các nội dung chưa đạt yêu cầu, ví dụ: Biên bản xác minh thiếu ảnh chụp nghiệm thu hiện trường đã khắc phục; cần kiểm tra lại hiện tượng rò rỉ tại vị trí phản ánh..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white font-medium text-slate-900"
                  required
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (mode === 'rework' && reworkReason.trim().length < 10)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'close'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : mode === 'close' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận đóng hồ sơ</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Gửi yêu cầu xử lý lại</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
