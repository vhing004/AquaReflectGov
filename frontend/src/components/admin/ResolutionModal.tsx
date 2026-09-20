import React, { useState } from 'react';
import { X, FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

interface ResolutionModalProps {
  petitionId: string;
  trackingCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDocumentNumber?: string;
  initialConclusionText?: string;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  petitionId,
  trackingCode,
  isOpen,
  onClose,
  onSuccess,
  initialDocumentNumber = '',
  initialConclusionText = '',
}) => {
  const [documentNumber, setDocumentNumber] = useState(initialDocumentNumber);
  const [conclusionText, setConclusionText] = useState(initialConclusionText);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('Dung lượng tệp văn bản không được vượt quá 25MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conclusionText.trim()) {
      setErrorMessage('Vui lòng nhập nội dung kết luận và biện pháp giải quyết.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('ConclusionText', conclusionText.trim());
      if (documentNumber.trim()) {
        formData.append('DocumentNumber', documentNumber.trim());
      }
      if (selectedFile) {
        formData.append('OfficialDocument', selectedFile);
      }

      await adminApi.updateResolution(petitionId, formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosError?.response?.data?.message || 'Có lỗi xảy ra khi ban hành kết luận giải quyết.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006194] to-[#0284c7] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Ban Hành Kết Luận & Quyết Định Giải Quyết</h2>
              <p className="text-xs text-sky-100">
                Hồ sơ: <strong className="font-mono font-bold text-white">{trackingCode}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Document Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Số hiệu văn bản / Quyết định xử lý:
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ví dụ: Số 128/KL-CCTS hoặc 45/QĐ-XPHC"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium text-slate-800 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Số văn bản chính thức của Chi cục / Sở Nông nghiệp & PTNT ban hành.
            </p>
          </div>

          {/* Conclusion Text */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nội dung kết luận & Biện pháp giải quyết <span className="text-rose-500">*</span>:
            </label>
            <textarea
              rows={4}
              value={conclusionText}
              onChange={(e) => setConclusionText(e.target.value)}
              placeholder="Tóm tắt kết quả kiểm tra thực địa, biện pháp khắc phục ô nhiễm, xử lý tàu cá vi phạm hoặc hỗ trợ người nuôi..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-800 placeholder-slate-400 leading-relaxed resize-none"
            />
          </div>

          {/* File Upload with Red Seal */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Văn bản quét có dấu đỏ / Ký số chính thức:
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-sky-500 hover:bg-sky-50/30 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <div className="flex text-xs text-slate-600 justify-center">
                  <span className="font-bold text-[#006194]">Chọn tệp văn bản</span>
                  <span className="pl-1">hoặc kéo thả vào đây</span>
                </div>
                <p className="text-[10px] text-slate-400">PDF, DOCX, DOC, JPG, PNG tối đa 25MB</p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 mt-2">
                <div className="flex items-center space-x-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-emerald-600">
                    ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-xs"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Ban hành & Đóng dấu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
