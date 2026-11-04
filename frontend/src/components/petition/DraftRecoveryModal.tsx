import React from 'react';
import { RotateCcw, Trash2, Clock, MapPin, Tag, Layers, AlertCircle } from 'lucide-react';

export interface DraftPreviewInfo {
  title?: string;
  categoryName?: string;
  savedAt?: string;
  currentStep?: number;
  location?: string;
}

interface DraftRecoveryModalProps {
  isOpen: boolean;
  draftInfo: DraftPreviewInfo | null;
  onRestore: () => void;
  onDiscard: () => void;
}

/**
 * Modal hỏi người dân "Tiếp tục bản nháp?" khi quay lại trang /submit
 * Theo đặc tả AF-01 — Tự động lưu nháp & khôi phục dữ liệu
 */
export const DraftRecoveryModal: React.FC<DraftRecoveryModalProps> = ({
  isOpen,
  draftInfo,
  onRestore,
  onDiscard,
}) => {
  if (!isOpen || !draftInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-modal-title"
      >
        {/* Header với dải màu thương hiệu & icon */}
        <div className="bg-linear-to-r from-sky-600 to-[#006194] px-6 py-5 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                Phát hiện bản nháp tự động
              </span>
              <h3 id="draft-modal-title" className="text-lg font-bold leading-tight">
                Tiếp tục bản nháp?
              </h3>
            </div>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Hệ thống nhận thấy bạn có một phản ánh đang soạn dở chưa được gửi. Bạn có muốn tiếp tục hoàn tất nội dung này không?
          </p>

          {/* Hộp xem trước tóm tắt thông tin nháp */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
            {draftInfo.savedAt && (
              <div className="flex items-center space-x-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Lưu lần cuối: <strong className="text-slate-800">{draftInfo.savedAt}</strong>
                </span>
              </div>
            )}

            {draftInfo.title && (
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#006194] shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  <span className="text-slate-500">Tiêu đề:</span>{' '}
                  <strong className="text-slate-900">{draftInfo.title}</strong>
                </span>
              </div>
            )}

            {draftInfo.categoryName && (
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  <span className="text-slate-500">Chuyên mục:</span>{' '}
                  <strong className="text-emerald-700">{draftInfo.categoryName}</strong>
                </span>
              </div>
            )}

            {draftInfo.location && (
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  <span className="text-slate-500">Địa bàn:</span>{' '}
                  <strong className="text-slate-800">{draftInfo.location}</strong>
                </span>
              </div>
            )}

            {draftInfo.currentStep && draftInfo.currentStep > 1 && (
              <div className="flex items-center space-x-2 text-slate-500">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>
                  Đang dừng tại: <strong className="text-indigo-600">Bước {draftInfo.currentStep} / 4</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onDiscard}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bắt đầu mới (Xóa nháp)</span>
          </button>
          <button
            type="button"
            onClick={onRestore}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#004f7a] text-white font-bold text-xs shadow-md shadow-sky-900/10 transition-all flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tiếp tục bản nháp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

