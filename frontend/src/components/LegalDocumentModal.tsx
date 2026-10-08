import React, { useEffect, useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, Shield } from 'lucide-react';
import type { LegalDocument } from '../data/legalDocumentsData';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Xử lý hiệu ứng mở/đóng mượt mượt (Smooth Fade-in / Scale-up & Fade-out / Scale-down)
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      window.document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 250);
      window.document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Đóng modal khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  if (!isRendered || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = window.document.createElement('a');
    const file = new Blob([`${document.title}\nSố hiệu: ${document.code}\n${document.summary}`], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${document.code.replace(/[/]/g, '_')}_VanBanPhapLy.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Background click listener */}
      <div className="fixed inset-0 z-0" onClick={handleClose} />

      {/* Main Modal Box Container với Animation Scale & Slide */}
      <div
        className={`relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto transform transition-all duration-300 ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0 ease-out'
            : 'opacity-0 scale-95 translate-y-4 ease-in'
        }`}
      >
        {/* 1. MODAL HEADER BAR */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                Hệ Thống Cơ Sở Dữ Liệu Văn Bản Pháp Luật Thủy Sản
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                {document.code} - {document.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              title="In văn bản quy phạm"
            >
              <Printer className="w-4 h-4" />
              <span>In văn bản</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Tải văn bản đính kèm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. THỂ THỨC VĂN BẢN PHÁP NGUYÊN BẢN (BODY CONTAINER) */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-amber-50/20 text-slate-900 font-serif leading-relaxed select-text">
          {/* Quốc Hiệu & Tiêu Ngữ Chuẩn Văn Bản Nhà Nước */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4 font-sans text-xs">
            <div className="text-center sm:text-left space-y-1">
              <p className="font-extrabold uppercase text-slate-800 tracking-wide">{document.issuingAuthority}</p>
              <p className="font-bold text-slate-600">Số: <span className="font-mono text-sky-900 font-extrabold">{document.code}</span></p>
            </div>

            <div className="text-center sm:text-right space-y-1 w-full sm:w-auto">
              <p className="font-extrabold uppercase text-slate-900 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-slate-700 italic border-b-2 border-slate-800 inline-block pb-1">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[11px] text-slate-500 italic mt-1">Hà Nội, ngày {document.issueDate}</p>
            </div>
          </div>

          {/* Tiêu Đề Văn Bản In Hoa Chính Thức */}
          <div className="text-center space-y-3 py-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide leading-snug">
              {document.title}
            </h1>
            <p className="text-xs sm:text-sm font-sans font-semibold text-slate-600 max-w-2xl mx-auto italic">
              "{document.summary}"
            </p>
          </div>

          {/* Căn Cứ Pháp Lý Ban Hành */}
          <div className="space-y-2 text-xs sm:text-sm italic text-slate-700 font-sans border-l-4 border-sky-600 pl-4 py-1 bg-sky-50/50 rounded-r-xl">
            {document.legalBases.map((base, idx) => (
              <p key={idx}>{base}</p>
            ))}
          </div>

          {/* Nội Dung Chi Tiết Theo Các Chương & Điều Khoản */}
          <div className="space-y-8 pt-4 font-sans">
            {document.chapters.map((chap, chapIdx) => (
              <div key={chapIdx} className="space-y-4">
                <h2 className="text-sm sm:text-base font-extrabold text-[#006194] uppercase tracking-wide border-b border-sky-100 pb-2">
                  {chap.chapterTitle}
                </h2>

                <div className="space-y-4 pl-2">
                  {chap.articles.map((art, artIdx) => (
                    <div key={artIdx} className="space-y-2 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {art.articleTitle}
                      </h3>
                      <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed pl-2">
                        {art.content.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Nơi Nhận & Chữ Ký Dấu Đỏ Công Vụ */}
          <div className="pt-8 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 font-sans text-xs">
            <div className="space-y-1 text-slate-500">
              <p className="font-bold text-slate-700 uppercase">Nơi nhận:</p>
              <p>- Như Điều khoản thi hành;</p>
              <p>- Văn phòng Chính phủ / Quốc hội;</p>
              <p>- UBND các Tỉnh, Thành phố trực thuộc TW;</p>
              <p>- Lưu: VT, PC.</p>
            </div>

            <div className="text-center space-y-2 relative pr-6">
              <p className="font-extrabold uppercase text-slate-800">{document.signerTitle}</p>

              {/* Con dấu đỏ mô phỏng công vụ */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-rose-600 border-dashed flex flex-col items-center justify-center text-rose-600 p-1 transform -rotate-12 opacity-85 shadow-sm">
                  <span className="text-[8px] font-black uppercase tracking-tighter">CỘNG HÒA X.H.C.N VIỆT NAM</span>
                  <Shield className="w-6 h-6 text-rose-600 my-0.5" />
                  <span className="text-[7px] font-bold uppercase">ỦY BAN NHÂN DÂN</span>
                </div>
              </div>

              <p className="font-extrabold text-sm text-slate-900">{document.signerName}</p>
            </div>
          </div>
        </div>

        {/* 3. MODAL FOOTER BAR */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Văn bản đã được đối chiếu khớp với Cơ sở dữ liệu Pháp luật Quốc gia</span>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
