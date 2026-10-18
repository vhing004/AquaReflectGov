import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Printer,
  Download,
} from 'lucide-react';

interface AnonymousPinModalProps {
  trackingCode: string;
  accessPin: string;
  onClose: () => void; // Gọi sau khi người dùng xác nhận đã lưu PIN
}

/**
 * Modal hiển thị mã PIN bảo mật cho đơn vô danh — CHỈ hiển thị 1 lần duy nhất.
 * Người dùng PHẢI sao chép hoặc in trước khi đóng. Sau khi đóng PIN không thể khôi phục.
 */
export const AnonymousPinModal: React.FC<AnonymousPinModalProps> = ({
  trackingCode,
  accessPin,
  onClose,
}) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const formattedPin = accessPin.match(/.{1,4}/g)?.join(' - ') ?? accessPin;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(accessPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleCopyAll = () => {
    const text =
      `HỒ SƠ PHẢN ÁNH KIẾN NGHỊ VÔ DANH\n` +
      `Mã tra cứu (Tracking Code): ${trackingCode}\n` +
      `Mã PIN bảo mật: ${accessPin}\n` +
      `Lưu ý: Cần cả hai mã trên để tra cứu, bổ sung thông tin hoặc rút đơn.`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=480,height=360');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Mã PIN bảo mật — ${trackingCode}</title>
          <style>
            body { font-family: monospace; padding: 32px; }
            h2 { font-size: 14px; color: #dc2626; margin-bottom: 16px; }
            .label { font-size: 11px; color: #64748b; margin-top: 12px; }
            .value { font-size: 22px; font-weight: 900; letter-spacing: 4px; color: #0f172a; }
            .warn { font-size: 11px; color: #b45309; border: 1px solid #fbbf24; padding: 8px 12px; border-radius: 6px; margin-top: 20px; background: #fffbeb; }
          </style>
        </head>
        <body>
          <h2>⚠️ MÃ PIN BẢO MẬT — CHỈ IN 1 LẦN</h2>
          <div class="label">Mã hồ sơ tra cứu</div>
          <div class="value">${trackingCode}</div>
          <div class="label">Mã PIN bảo mật (giữ bí mật)</div>
          <div class="value">${formattedPin}</div>
          <div class="warn">
            Mã PIN này chỉ hiển thị một lần duy nhất trên hệ thống. Quý vị cần bảo lưu cẩn thận.
            Dùng cả Mã hồ sơ + Mã PIN để tra cứu, bổ sung thông tin hoặc rút đơn.
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden">

        {/* HEADER — cảnh báo khẩn cấp */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100">
                Bảo mật — Chỉ hiển thị 1 lần
              </p>
              <h3 className="text-base font-extrabold text-white leading-tight">
                Mã PIN Truy Cập Bảo Mật
              </h3>
            </div>
          </div>
          {/* Không có nút X để bắt buộc người dùng đọc */}
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* Cảnh báo lớn */}
          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-50 border border-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-900">
              <p className="font-extrabold text-sm text-amber-800 mb-1">
                ⚠️ Mã PIN chỉ hiển thị DUY NHẤT lần này!
              </p>
              Sau khi đóng hộp thoại này, hệ thống <strong>không thể khôi phục</strong> mã PIN.
              Quý công dân cần mã này để <strong>tra cứu chi tiết</strong>, <strong>bổ sung tài liệu</strong>
              hoặc <strong>rút đơn</strong> khi cần thiết.
            </div>
          </div>

          {/* Mã hồ sơ */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <p className="text-[10px] uppercase font-bold text-sky-600 mb-1">Mã hồ sơ tra cứu</p>
            <p className="font-mono text-2xl font-black text-sky-800 tracking-wider">
              {trackingCode}
            </p>
          </div>

          {/* Mã PIN */}
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 relative">
            <p className="text-[10px] uppercase font-bold text-rose-600 mb-2 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Mã PIN bảo mật (Giữ bí mật tuyệt đối)</span>
            </p>

            <div className="flex items-center justify-between">
              <p className="font-mono text-2xl font-black tracking-[6px] text-rose-800 select-all">
                {showPin ? formattedPin : '●●●● - ●●●●'}
              </p>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="ml-3 p-2 rounded-xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                title={showPin ? 'Ẩn PIN' : 'Hiện PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {showPin && (
              <p className="mt-2 font-mono text-xs text-rose-500 break-all select-all">
                (không dấu cách): <strong>{accessPin}</strong>
              </p>
            )}
          </div>

          {/* Action buttons — sao chép & in */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyPin}
              className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {copiedPin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPin ? 'Đã sao chép PIN!' : 'Sao chép PIN'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Đã sao chép!' : 'Sao chép cả 2 mã'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors col-span-2"
            >
              <Printer className="w-4 h-4" />
              <span>In phiếu bảo mật (trang trắng)</span>
            </button>
          </div>

          {/* Checkbox xác nhận */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Tôi đã <strong>sao chép hoặc ghi lại</strong> cả Mã hồ sơ và Mã PIN vào nơi an toàn.
              Tôi hiểu rằng mã PIN này <strong>sẽ biến mất</strong> sau khi đóng hộp thoại này.
            </span>
          </label>

          {/* Nút đóng — chỉ bật khi đã xác nhận */}
          <button
            type="button"
            onClick={onClose}
            disabled={!confirmed}
            className={`w-full py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center justify-center space-x-2 ${
              confirmed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>
              {confirmed
                ? '✓ Đã lưu xong — Xem biên nhận hồ sơ'
                : 'Vui lòng xác nhận đã lưu PIN trước khi tiếp tục'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
