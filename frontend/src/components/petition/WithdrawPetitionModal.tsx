import React, { useState } from 'react';
import {
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  X,
  CheckCircle2,
  FileX,
  ShieldAlert,
} from 'lucide-react';
import { petitionApi } from '../../api/petitionApi';

interface WithdrawPetitionModalProps {
  trackingCode: string;
  isAnonymous: boolean;
  currentStatus: string; // 'Submitted' | 'Assigned'
  onSuccess: (message: string) => void;
  onClose: () => void;
}

/**
 * Modal xác nhận rút đơn phản ánh.
 * - Đơn định danh: Cần đăng nhập (JWT được gửi tự động qua axiosClient).
 * - Đơn vô danh: Cần nhập mã PIN 8 ký tự đã lưu lúc nộp đơn.
 */
export const WithdrawPetitionModal: React.FC<WithdrawPetitionModalProps> = ({
  trackingCode,
  isAnonymous,
  currentStatus,
  onSuccess,
  onClose,
}) => {
  const [accessPin, setAccessPin] = useState('');
  const [reason, setReason] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const statusLabel = currentStatus === 'Submitted' ? 'Đã tiếp nhận' : 'Đang xử lý';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('Vui lòng xác nhận bằng cách tick vào ô đồng ý trước khi tiếp tục.');
      return;
    }
    if (isAnonymous && accessPin.trim().length < 6) {
      setError('Mã PIN bảo mật phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await petitionApi.withdrawPetition(
        trackingCode,
        isAnonymous ? accessPin.trim().toUpperCase() : undefined,
        reason.trim() || undefined
      );
      if (res.success && res.data) {
        onSuccess(res.data.message || `Đơn ${trackingCode} đã được rút thành công.`);
      } else {
        setError(res.message || 'Không thể rút đơn. Vui lòng kiểm tra lại.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (isAnonymous
          ? 'Mã PIN không đúng hoặc đơn này không thể rút. Vui lòng kiểm tra lại.'
          : 'Không có quyền rút đơn này hoặc trạng thái không cho phép.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-rose-600 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <FileX className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-100">
                Hành động không thể hoàn tác
              </p>
              <h3 className="text-sm font-extrabold text-white">Yêu Cầu Rút Đơn Phản Ánh</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Thông tin hồ sơ */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500">Mã hồ sơ</p>
              <p className="font-mono font-black text-[#006194] text-base">{trackingCode}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Trạng thái hiện tại</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Cảnh báo */}
          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-900 leading-relaxed">
              Sau khi rút đơn, <strong>hồ sơ sẽ chuyển sang trạng thái Đã Rút</strong> và
              không thể phục hồi. Cơ quan tiếp nhận sẽ nhận được thông báo tự động về việc rút đơn.
            </p>
          </div>

          {/* PIN input — chỉ hiển thị với đơn vô danh */}
          {isAnonymous && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Mã PIN bảo mật <span className="text-rose-600">*</span></span>
              </label>
              <p className="text-[11px] text-slate-500">
                Nhập mã PIN 8 ký tự bạn đã nhận khi nộp đơn vô danh để xác thực quyền rút đơn.
              </p>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={8}
                  placeholder="Nhập 8 ký tự PIN (vd: A3BK9XZT)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30 uppercase"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {accessPin.length}/8 ký tự đã nhập
                {accessPin.length === 8 && (
                  <CheckCircle2 className="inline w-3.5 h-3.5 ml-1.5 text-emerald-500" />
                )}
              </p>
            </div>
          )}

          {/* Lý do rút đơn */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Lý do rút đơn <span className="font-normal text-slate-400">(tùy chọn)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Vụ việc đã được giải quyết bằng con đường khác, hoặc thông tin ban đầu chưa chính xác..."
              rows={3}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006194] resize-none bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 text-right">{reason.length}/500</p>
          </div>

          {/* Checkbox xác nhận */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-rose-600 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Tôi hiểu rằng hành động <strong>rút đơn là không thể hoàn tác</strong> và
              đồng ý chịu trách nhiệm với quyết định này.
            </span>
          </label>

          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !confirmed || (isAnonymous && accessPin.length < 6)}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FileX className="w-4 h-4" />
                  <span>Xác nhận Rút Đơn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
