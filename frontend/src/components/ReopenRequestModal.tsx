import React, { useState } from 'react';
import { AlertTriangle, X, Send, ShieldAlert } from 'lucide-react';
import { petitionApi } from '../api/petitionApi';

interface ReopenRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingCode: string;
  isAnonymous?: boolean;
  onSuccess: (message: string) => void;
}

export const ReopenRequestModal: React.FC<ReopenRequestModalProps> = ({
  isOpen,
  onClose,
  trackingCode,
  isAnonymous = false,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Vui lòng nêu rõ lý do đề nghị xem xét lại (tối thiểu 10 ký tự).');
      return;
    }

    if (isAnonymous && !accessPin.trim()) {
      setError('Đơn ẩn danh yêu cầu mã PIN bảo mật đã nhận lúc gửi đơn.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await petitionApi.requestReopen(trackingCode, reason.trim(), isAnonymous ? accessPin.trim() : undefined);
      if (res.success) {
        onSuccess(res.message || 'Đề nghị xem xét lại đã được gửi thành công.');
        onClose();
      } else {
        setError(res.message || 'Có lỗi xảy ra khi gửi đề nghị xem xét lại.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi đề nghị xem xét lại hồ sơ.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="text-base font-bold">Đề nghị xem xét lại hồ sơ</h3>
              <p className="text-xs text-amber-100/90 font-mono">Mã: #{trackingCode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              Lưu ý quy định mở lại hồ sơ:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 pl-1">
              <li>Mỗi hồ sơ chỉ được mở lại xem xét <strong>tối đa 01 lần</strong>.</li>
              <li>Áp dụng cho hồ sơ có đánh giá CSAT <strong>≤ 2 sao</strong> trong vòng <strong>14 ngày</strong> kể từ khi hoàn tất/đóng hồ sơ.</li>
              <li>Hồ sơ sẽ được chuyển lại cho Cán bộ điều phối thẩm định nguyên nhân và tái phân công xử lý.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isAnonymous && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã PIN bảo mật <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                placeholder="Nhập mã PIN đã nhận khi nộp đơn ẩn danh"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do bạn đề nghị xem xét lại <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nêu rõ lý do bạn chưa đồng thuận với kết quả giải quyết (ví dụ: thực địa chưa được xử lý triệt để, thông tin kết luận chưa chính xác...)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Tối thiểu 10 ký tự ({reason.trim().length}/10)</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 10}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Đang gửi...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Đề Nghị Xem Xét Lại</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
