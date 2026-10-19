import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  FileText, 
  Trash2, 
  Clock, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { petitionApi } from '../../api/petitionApi';
import type { SubmitAdditionalInfoResult } from '../../types';

interface SubmitAdditionalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingCode: string;
  isAnonymous: boolean;
  needInfoReason?: string;
  needInfoDeadline?: string;
  onSuccess: (result: SubmitAdditionalInfoResult) => void;
}

export const SubmitAdditionalInfoModal: React.FC<SubmitAdditionalInfoModalProps> = ({
  isOpen,
  onClose,
  trackingCode,
  isAnonymous,
  needInfoReason,
  needInfoDeadline,
  onSuccess
}) => {
  const [additionalContent, setAdditionalContent] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [citizenPhone, setCitizenPhone] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    // Giới hạn tối đa 5 tệp
    if (selectedFiles.length + filesArray.length > 5) {
      setErrorMessage('Chỉ được đính kèm tối đa 5 tệp.');
      return;
    }

    // Kiểm tra dung lượng từng tệp <= 15MB
    const overSizeFile = filesArray.find(f => f.size > 15 * 1024 * 1024);
    if (overSizeFile) {
      setErrorMessage(`Tệp "${overSizeFile.name}" vượt quá dung lượng tối đa 15MB.`);
      return;
    }

    setErrorMessage(null);
    setSelectedFiles(prev => [...prev, ...filesArray]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanContent = additionalContent.trim();
    if (cleanContent.length < 10) {
      setErrorMessage('Nội dung giải trình / thông tin bổ sung phải có ít nhất 10 ký tự.');
      return;
    }

    if (isAnonymous && !accessPin.trim()) {
      setErrorMessage('Hồ sơ ẩn danh yêu cầu nhập Mã PIN bảo mật đã được cấp lúc nộp đơn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('additionalContent', cleanContent);
      if (isAnonymous) {
        formData.append('accessPin', accessPin.trim());
      } else if (citizenPhone.trim()) {
        formData.append('citizenPhone', citizenPhone.trim());
      }

      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await petitionApi.submitAdditionalInfo(trackingCode, formData);
      if (response.success && response.data) {
        onSuccess(response.data);
        onClose();
      } else {
        setErrorMessage(response.message || 'Không thể gửi thông tin bổ sung. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverMessage = axiosErr.response?.data?.message;
      const validationErrors = axiosErr.response?.data?.errors;
      if (validationErrors) {
        const firstErr = Object.values(validationErrors).flat()[0];
        setErrorMessage(firstErr || 'Thông tin nhập chưa hợp lệ.');
      } else {
        setErrorMessage(serverMessage || 'Đã có lỗi xảy ra khi nộp thông tin bổ sung. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                Bổ sung thông tin hồ sơ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mã tra cứu: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{trackingCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Yêu cầu từ cán bộ & Hạn chót */}
          {needInfoReason && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-sm space-y-1.5">
              <div className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Yêu cầu từ Cán bộ phụ trách:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 pl-6 leading-relaxed">
                {needInfoReason}
              </p>
              {needInfoDeadline && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 pl-6 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hạn chót bổ sung: {new Date(needInfoDeadline).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          )}

          {/* Ô nhập thông tin bổ sung */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nội dung thông tin / giải trình bổ sung <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={additionalContent}
              onChange={e => setAdditionalContent(e.target.value)}
              placeholder="Mô tả cụ thể thông tin hiện trường, giải thích rõ các điểm còn thiếu sót theo yêu cầu của cán bộ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm transition resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>Tối thiểu 10 ký tự</span>
              <span>{additionalContent.length}/3000 ký tự</span>
            </div>
          </div>

          {/* Đính kèm tệp */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tệp minh chứng hiện trường mới (Ảnh, video, tài liệu)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                Bấm để chọn tệp hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Tối đa 5 tệp (JPG, PNG, WEBP, MP4, PDF, DOCX), mỗi tệp ≤ 15MB
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*,video/mp4,video/quicktime,application/pdf,.docx"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>

            {/* Danh sách tệp đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">{file.name}</span>
                      <span className="text-slate-400 shrink-0">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={isSubmitting}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Xác thực bảo mật */}
          {isAnonymous ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mã PIN bảo mật hồ sơ ẩn danh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={16}
                  value={accessPin}
                  onChange={e => setAccessPin(e.target.value.toUpperCase())}
                  placeholder="Nhập mã PIN 8 ký tự..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono tracking-widest uppercase focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm transition"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Mã PIN 8 ký tự được cung cấp trên phiếu biên nhận khi bạn nộp hồ sơ.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại người gửi <span className="text-slate-400 font-normal">(nếu chưa đăng nhập)</span>
              </label>
              <input
                type="tel"
                value={citizenPhone}
                onChange={e => setCitizenPhone(e.target.value)}
                placeholder="Nhập số điện thoại đã khai báo lúc nộp đơn..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm transition"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Lỗi cảnh báo */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Footer Hành động */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || additionalContent.trim().length < 10}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi bổ sung...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gửi thông tin bổ sung</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
