import React, { useState } from 'react';
import { Search, QrCode, FileSearch } from 'lucide-react';

export const TrackPetitionPage: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tra cứu mã: ${trackingCode} (Tính năng tra cứu kết nối API chi tiết sẽ được hoàn thiện ở Giai đoạn 2)`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Cổng Tra Cứu Công Khai</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Tra Cứu Tiến Độ Xử Lý Phản Ánh</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Nhập mã tra cứu (ví dụ: TS-2026-X89K2) hoặc số điện thoại người gửi để theo dõi các bước thẩm tra và văn bản giải quyết.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mã hồ sơ tra cứu hoặc Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileSearch className="w-5 h-5 text-sky-500" />
              </div>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Nhập mã hồ sơ (TS-2026-...) hoặc số điện thoại"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500 font-mono font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Kiểm Tra Tiến Độ Ngay</span>
          </button>
        </form>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-slate-500" />
            <span>Hỗ trợ quét mã QR trên giấy hẹn hoặc biên nhận điện tử</span>
          </div>
          <span className="font-semibold text-sky-600">Giai đoạn 2</span>
        </div>
      </div>
    </div>
  );
};
