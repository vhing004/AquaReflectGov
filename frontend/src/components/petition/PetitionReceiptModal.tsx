import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { CreatePetitionResult } from '../../types';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PetitionReceiptModalProps {
  petition: CreatePetitionResult;
  onClose: () => void;
  onNewPetition: () => void;
}

export const PetitionReceiptModal: React.FC<PetitionReceiptModalProps> = ({
  petition,
  onClose,
  onNewPetition,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const trackingUrl = `${window.location.origin}/track?code=${encodeURIComponent(petition.trackingCode)}`;

  // Generate QR code on mount
  useEffect(() => {
    QRCode.toDataURL(trackingUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#006194',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Lỗi tạo mã QR:', err));
  }, [trackingUrl]);

  const copyCode = () => {
    navigator.clipboard.writeText(petition.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `Mã_QR_TraCuu_${petition.trackingCode}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* TOP HEADER */}
        <div className="bg-gradient-to-r from-[#006194] to-[#0284c7] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-200 block">
                Biểu Mẫu Số 04B / CVC-BCH
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Biên Nhận Tiếp Nhận Phản Ánh Điện Tử
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:p-0">
          {/* Success badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">
                Hồ sơ đã được mã hóa và chuyển giao thành công!
              </p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">
                Hệ thống giám sát 24/7 đã cấp số bộ tiếp nhận và kích hoạt đồng hồ cam kết hạn giải quyết (SLA). Quý ngư dân có thể quét mã QR dưới đây hoặc lưu lại mã hồ sơ để tra cứu tiến độ mọi lúc.
              </p>
            </div>
          </div>

          {/* DUAL COLUMN: QR CODE + RECEIPT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* CỘT TRÁI: MÃ QR CODE TỰ SINH */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="p-2 bg-white rounded-2xl shadow-xs border border-slate-200">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt={`Mã QR ${petition.trackingCode}`}
                    className="w-44 h-44 rounded-xl"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                    Đang tạo mã QR...
                  </div>
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-800 block">
                  Quét QR để xem tiến độ
                </span>
                <span className="text-[10px] text-slate-500">
                  Tương thích Zalo / Camera điện thoại
                </span>
              </div>
              <button
                type="button"
                onClick={downloadQr}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#006194] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh QR về máy</span>
              </button>
            </div>

            {/* CỘT PHẢI: THÔNG TIN BIÊN NHẬN SỐ */}
            <div className="sm:col-span-7 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#006194] block">
                  Mã biên nhận tra cứu (Tracking Code)
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-[#006194]">
                    #{petition.trackingCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-[#006194] font-bold text-[11px] flex items-center space-x-1 hover:bg-sky-50 transition-colors shadow-2xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tiêu đề:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[210px] truncate">
                    {petition.title}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Chuyên mục:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {petition.categoryName}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cơ quan thụ lý:</span>
                  <span className="font-bold text-[#006194] flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-[#006194]" />
                    <span>Chi cục Thủy sản tỉnh</span>
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Thời hạn cam kết (SLA):</span>
                  <span className="font-bold text-rose-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{petition.defaultSlaHours} Giờ làm việc</span>
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hạn chót giải quyết:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(petition.dueDate).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tệp minh chứng đã lưu:</span>
                  <span className="font-semibold text-emerald-700">
                    {petition.attachments?.length || 0} tệp đính kèm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>In phiếu tiếp nhận</span>
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                <span>{copiedLink ? 'Đã sao chép link' : 'Chia sẻ link'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onNewPetition}
                className="px-4 py-2.5 rounded-xl border border-[#006194] text-[#006194] hover:bg-sky-50 text-xs font-bold transition-colors"
              >
                Gửi phản ánh khác
              </button>
              <Link
                to={`/track?code=${encodeURIComponent(petition.trackingCode)}`}
                className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <span>Xem tiến độ ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
