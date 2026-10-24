import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Loader2, 
  Send, 
  Clock, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { AdminPetitionDetail, ConclusionType } from '../../types';

interface InspectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  petition: AdminPetitionDetail;
  mode: 'submit' | 'review'; // submit: cán bộ nộp báo cáo; review: trưởng đơn vị duyệt
  onSuccess: (message: string) => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  isOpen,
  onClose,
  petition,
  mode,
  onSuccess,
}) => {
  // Form fields cho nộp báo cáo (submit mode)
  const [reportContent, setReportContent] = useState<string>('');
  
  // Form fields cho duyệt kết luận (review mode)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [resolutionSummary, setResolutionSummary] = useState<string>(
    petition.inspectionReport || petition.resolutionSummary || ''
  );
  const [conclusionType, setConclusionType] = useState<ConclusionType>('Valid');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportContent.trim() || reportContent.trim().length < 15) {
      setErrorMessage('Vui lòng nhập nội dung báo cáo nghiệm thu thực địa chi tiết (tối thiểu 15 ký tự).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Chuyển sang 11 - PendingApproval
      const res = await adminApi.transitionStatus(petition.id, {
        toStatus: 11,
        resolutionSummary: reportContent.trim(),
        note: `Cán bộ ${petition.assignedUserName || ''} nộp báo cáo nghiệm thu lên Trưởng đơn vị.`,
      });

      if (res.success) {
        onSuccess('Đã gửi báo cáo nghiệm thu lên Trưởng đơn vị xem xét & phê duyệt thành công.');
        onClose();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || 'Lỗi khi nộp báo cáo nghiệm thu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (reviewAction === 'approve') {
        if (!resolutionSummary.trim()) {
          setErrorMessage('Vui lòng nhập tóm tắt kết luận và biện pháp giải quyết chính thức.');
          setIsSubmitting(false);
          return;
        }

        // Chuyển sang 4 - Resolved
        const res = await adminApi.transitionStatus(petition.id, {
          toStatus: 4,
          resolutionSummary: resolutionSummary.trim(),
          note: 'Trưởng đơn vị xác nhận nghiệm thu và ban hành kết luận xử lý chính thức.',
        });

        if (res.success) {
          onSuccess('Đã phê duyệt nghiệm thu và ban hành kết luận xử lý phản ánh thành công.');
          onClose();
        }
      } else {
        // Trả về yêu cầu thẩm tra lại: 3 - Investigating
        if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
          setErrorMessage('Vui lòng nêu rõ lý do yêu cầu thẩm tra lại (tối thiểu 10 ký tự).');
          setIsSubmitting(false);
          return;
        }

        const res = await adminApi.transitionStatus(petition.id, {
          toStatus: 3,
          note: rejectionReason.trim(),
        });

        if (res.success) {
          onSuccess('Đã trả hồ sơ về cho cán bộ chuyên viên tiếp tục xác minh.');
          onClose();
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || 'Lỗi khi xử lý báo cáo nghiệm thu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-6 py-5 text-white flex items-center justify-between ${
          mode === 'submit'
            ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900'
            : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {mode === 'submit' ? (
                <FileText className="w-5 h-5 text-blue-200" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {mode === 'submit' ? 'Lập Báo Cáo Nghiệm Thu Hiện Trường' : 'Thẩm Định & Duyệt Báo Cáo Nghiệm Thu'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Hồ sơ: <span className="font-mono font-medium text-white">{petition.trackingCode}</span> • {petition.categoryName}
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

        {/* Content */}
        {mode === 'submit' ? (
          <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100/80 text-xs text-blue-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-blue-800">
                <Clock className="w-4 h-4 text-blue-600" /> Quy trình nghiệm thu nội bộ:
              </div>
              <p>
                Sau khi gửi báo cáo, hồ sơ sẽ chuyển sang trạng thái <strong>Chờ duyệt nghiệm thu (PendingApproval)</strong>. 
                Trưởng đơn vị sẽ nhận được thông báo để đọc, thẩm định và xác nhận ban hành kết luận chính thức.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Nội dung báo cáo nghiệm thu thực địa <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Trình bày chi tiết:&#10;1. Thời gian, địa điểm kiểm tra thực tế&#10;2. Hiện trạng ghi nhận (diện tích ảnh hưởng, nguồn xả thải, hành vi vi phạm...)&#10;3. Kết quả đo đạc / lấy mẫu kiểm định&#10;4. Biện pháp đã thực hiện và kiến nghị kết luận xử lý..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

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
                disabled={isSubmitting || !reportContent.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi báo cáo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi Trưởng đơn vị duyệt
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Review mode cho Trưởng đơn vị */
          <form onSubmit={handleReviewReport} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Báo cáo đã nộp của cán bộ */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" /> Báo cáo của cán bộ thụ lý:
                </span>
                <span className="text-xs text-slate-500">
                  {petition.assignedUserName || 'Cán bộ'} • {petition.inspectionReportSubmittedAt ? new Date(petition.inspectionReportSubmittedAt).toLocaleString('vi-VN') : 'Mới nộp'}
                </span>
              </div>
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200/80">
                {petition.inspectionReport || petition.resolutionSummary || 'Không có nội dung báo cáo.'}
              </div>
            </div>

            {/* Lựa chọn hành động: Duyệt hoặc Trả về */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Quyết định thẩm định của Trưởng đơn vị
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('approve')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    reviewAction === 'approve'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    reviewAction === 'approve' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Xác nhận nghiệm thu</div>
                    <div className="text-xs text-slate-500">Ban hành kết luận chính thức</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('reject')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    reviewAction === 'reject'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    reviewAction === 'reject' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Yêu cầu thẩm tra lại</div>
                    <div className="text-xs text-slate-500">Trả về cho cán bộ bổ sung</div>
                  </div>
                </button>
              </div>
            </div>

            {reviewAction === 'approve' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Đánh giá tính chuẩn xác phản ánh
                  </label>
                  <select
                    value={conclusionType}
                    onChange={(e) => setConclusionType(e.target.value as ConclusionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Valid">Phản ánh đúng sự thật (Đã xử lý dứt điểm)</option>
                    <option value="PartiallyValid">Phản ánh đúng một phần (Đã chấn chỉnh)</option>
                    <option value="InsufficientEvidence">Không đủ căn cứ / Sai sự thật</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Tóm tắt kết luận và kết quả giải quyết ban hành cho công dân <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Nhập kết luận chính thức để gửi thông báo cho người dân và lưu trữ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <label className="block text-sm font-semibold text-slate-800 mb-1.5 text-amber-900">
                  Lý do yêu cầu thẩm tra lại (tối thiểu 10 ký tự) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Cần lấy thêm mẫu nước tại cống xả thải số 2 và bổ sung biên bản làm việc với chủ hộ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
            )}

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
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : reviewAction === 'approve' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Xác nhận & Ban hành kết luận
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Yêu cầu thẩm tra lại
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
