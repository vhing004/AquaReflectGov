import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Eye, FileText, Film } from 'lucide-react';
import type { PetitionAttachment } from '../../types';

interface MediaLightboxProps {
  attachments: PetitionAttachment[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  attachments,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, attachments.length]);

  if (!isOpen || attachments.length === 0) return null;

  const current = attachments[currentIndex] || attachments[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  };

  const isImage = current.fileType?.toLowerCase().includes('image') || 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(current.fileName);

  const isVideo = current.fileType?.toLowerCase().includes('video') || 
    /\.(mp4|mov|webm|avi)$/i.test(current.fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-all">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
        <div className="flex items-center space-x-3 truncate">
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            {currentIndex + 1} / {attachments.length}
          </span>
          <span className="text-sm font-medium truncate max-w-xs sm:max-w-md">
            {current.originalFileName || current.fileName}
          </span>
          {current.fileSize !== undefined && current.fileSize !== null && (
            <span className="text-xs text-slate-400">
              ({Math.round(current.fileSize / 1024)} KB)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={current.fileUrl}
            download={current.originalFileName || current.fileName}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Tải tệp về máy"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors"
            title="Đóng xem ảnh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation buttons */}
      {attachments.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            title="Xem tệp trước (Phím mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            title="Xem tệp tiếp theo (Phím mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main content display */}
      <div className="max-w-5xl max-h-[80vh] flex flex-col items-center justify-center p-2 select-none">
        {isImage ? (
          <img
            src={current.fileUrl}
            alt={current.fileName}
            className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        ) : isVideo ? (
          <video
            src={current.fileUrl}
            controls
            autoPlay
            className="max-h-[75vh] max-w-full rounded-xl shadow-2xl"
          />
        ) : (
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl text-center text-white max-w-md">
            <FileText className="w-16 h-16 text-sky-400 mx-auto mb-4" />
            <p className="font-bold text-lg mb-2">{current.originalFileName || current.fileName}</p>
            <p className="text-sm text-slate-400 mb-6">Định dạng tài liệu văn bản hoặc tệp nén.</p>
            <a
              href={current.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors shadow-lg"
            >
              <Eye className="w-4 h-4" />
              <span>Mở hoặc tải tài liệu</span>
            </a>
          </div>
        )}
      </div>

      {/* Bottom thumbnails carousel */}
      {attachments.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-xl w-full flex items-center justify-center gap-2 overflow-x-auto p-2 bg-slate-900/60 rounded-2xl backdrop-blur-sm">
          {attachments.map((att, idx) => (
            <button
              key={att.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex ? 'border-sky-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {att.fileType?.toLowerCase().includes('video') ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                  <Film className="w-5 h-5 text-amber-400" />
                </div>
              ) : (
                <img
                  src={att.fileUrl}
                  alt={att.fileName}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
