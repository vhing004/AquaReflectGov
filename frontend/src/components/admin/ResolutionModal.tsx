import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  Trash2, 
  Film, 
  Sparkles,
  Layers
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

interface ResolutionModalProps {
  petitionId: string;
  trackingCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDocumentNumber?: string;
  initialConclusionText?: string;
  initialConclusionType?: number;
  initialPublicSummary?: string;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  petitionId,
  trackingCode,
  isOpen,
  onClose,
  onSuccess,
  initialDocumentNumber = '',
  initialConclusionText = '',
  initialConclusionType = 1,
  initialPublicSummary = '',
}) => {
  const [documentNumber, setDocumentNumber] = useState(initialDocumentNumber);
  const [conclusionText, setConclusionText] = useState(initialConclusionText);
  const [conclusionType, setConclusionType] = useState<number>(initialConclusionType);
  const [publicSummary, setPublicSummary] = useState(initialPublicSummary);
  
  // Tệp văn bản chính thức (có dấu đỏ / ký số)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Tệp ảnh/video/tài liệu minh chứng hoàn trả hiện trạng / biên bản xử phạt
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDocumentNumber(initialDocumentNumber);
      setConclusionText(initialConclusionText);
      setConclusionType(initialConclusionType || 1);
      setPublicSummary(initialPublicSummary);
      setSelectedFile(null);
      setEvidenceFiles([]);
      setErrorMessage(null);
    }
  }, [isOpen, initialDocumentNumber, initialConclusionText, initialConclusionType, initialPublicSummary]);

  if (!isOpen) return null;

  const handleOfficialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('Dung lượng tệp văn bản chính thức không được vượt quá 25MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleEvidenceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (evidenceFiles.length + newFiles.length > 5) {
      setErrorMessage('Chỉ được đính kèm tối đa 5 tệp minh chứng kết quả xử lý/khắc phục.');
      return;
    }

    for (const f of newFiles) {
      if (f.size > 25 * 1024 * 1024) {
        setErrorMessage(`Tệp "${f.name}" vượt quá giới hạn 25MB.`);
        return;
      }
    }

    setEvidenceFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
    if (evidenceInputRef.current) {
      evidenceInputRef.current.value = '';
    }
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Tự động sinh tóm tắt công khai dựa trên nội dung kết luận
  const handleGeneratePublicSummary = () => {
    if (!conclusionText.trim()) return;
    const lines = conclusionText.trim().split('\n').filter(Boolean);
    const summary = lines.slice(0, 2).join(' ');
    setPublicSummary(summary.slice(0, 300));
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
      formData.append('ConclusionType', conclusionType.toString());

      if (documentNumber.trim()) {
        formData.append('DocumentNumber', documentNumber.trim());
      }

      if (publicSummary.trim()) {
        formData.append('PublicSummary', publicSummary.trim());
      } else {
        formData.append('PublicSummary', conclusionText.trim().slice(0, 300));
      }

      if (selectedFile) {
        formData.append('OfficialDocument', selectedFile);
      }

      evidenceFiles.forEach((file) => {
        formData.append('EvidenceFiles', file);
      });

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

  const conclusionTypes = [
    {
      id: 1,
      title: 'Đúng sự thật',
      desc: 'Phản ánh chính xác sai phạm hoặc sự cố, cơ quan chức năng đã lập biên bản và có biện pháp xử lý triệt để.',
      icon: ShieldCheck,
      color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900',
      activeColor: 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-500/30 text-emerald-950 font-bold',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 2,
      title: 'Đúng một phần',
      desc: 'Nội dung phản ánh có yếu tố đúng thực tế nhưng mức độ hoặc bản chất có điểm khác biệt so với báo tin ban đầu.',
      icon: AlertTriangle,
      color: 'border-amber-300 bg-amber-50/70 text-amber-900',
      activeColor: 'border-amber-600 bg-amber-100 ring-2 ring-amber-500/30 text-amber-950 font-bold',
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 3,
      title: 'Không đủ căn cứ / Sai sự thật',
      desc: 'Kết quả khảo sát và đối chiếu chứng cứ cho thấy không có vi phạm, hoặc thông tin do công dân cung cấp không có căn cứ.',
      icon: XCircle,
      color: 'border-rose-300 bg-rose-50/70 text-rose-900',
      activeColor: 'border-rose-600 bg-rose-100 ring-2 ring-rose-500/30 text-rose-950 font-bold',
      badgeColor: 'bg-rose-600 text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004d77] via-[#006194] to-[#0284c7] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Layers className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Ban Hành Kết Luận & Quyết Định Giải Quyết (Task 4.2)
              </h2>
              <p className="text-xs text-sky-100">
                Hồ sơ: <strong className="font-mono font-bold text-white">{trackingCode}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center space-x-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Chọn loại kết luận (ConclusionType) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              1. Phân loại kết luận xác minh <span className="text-rose-500">*</span>:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {conclusionTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = conclusionType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setConclusionType(t.id)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected ? t.activeColor : t.color
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1.5 rounded-xl bg-white/80 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${t.badgeColor}`}>
                        Loại {t.id}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{t.title}</p>
                      <p className="text-[11px] opacity-80 leading-snug mt-1 line-clamp-3">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Số hiệu văn bản & Tóm tắt công khai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Số hiệu văn bản / Quyết định xử lý:
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ví dụ: 128/KL-CCTS hoặc 45/QĐ-XPHC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Số văn bản chính thức của Chi cục / Sở Nông nghiệp & PTNT.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  3. Tóm tắt kết quả công khai:
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePublicSummary}
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center space-x-1"
                  title="Tự động lấy 2 dòng đầu của kết luận chi tiết"
                >
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  <span>Trích xuất nhanh</span>
                </button>
              </div>
              <input
                type="text"
                value={publicSummary}
                onChange={(e) => setPublicSummary(e.target.value)}
                placeholder="Ví dụ: Đã xử phạt chủ cơ sở và khôi phục hiện trạng nguồn nước"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hiển thị tóm tắt cho người dân trên cổng tra cứu và bản đồ GIS.
              </p>
            </div>
          </div>

          {/* 3. Nội dung kết luận chi tiết */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                4. Nội dung kết luận & Biện pháp giải quyết <span className="text-rose-500">*</span>:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {conclusionText.length} ký tự
              </span>
            </div>
            <textarea
              rows={4}
              value={conclusionText}
              onChange={(e) => setConclusionText(e.target.value)}
              placeholder="Ghi rõ: Tóm tắt kết quả kiểm tra thực địa, căn cứ pháp lý, hình thức xử phạt (nếu có), biện pháp khắc phục môi trường, thời hạn hoàn trả hiện trạng..."
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-800 placeholder-slate-400 leading-relaxed resize-none bg-white font-medium"
            />
          </div>

          {/* 4. Tệp văn bản quyết định chính thức (Dấu đỏ / Ký số) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              5. Văn bản quét có dấu đỏ / Ký số chính thức:
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/30 p-4 rounded-2xl text-center cursor-pointer transition-all">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={handleOfficialFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1">
                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                <p className="text-xs font-bold text-[#006194]">
                  Bấm để chọn tệp quyết định hoặc kéo thả vào đây
                </p>
                <p className="text-[11px] text-slate-400">PDF, DOCX, DOC, JPG, PNG tối đa 25MB</p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center space-x-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-xs cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* 5. Tệp minh chứng kết quả xử lý / hoàn trả mặt bằng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>6. Minh chứng hiện trường khắc phục & Biên bản xử phạt ({evidenceFiles.length}/5):</span>
              </label>
              <span className="text-[11px] text-slate-400">Tối đa 5 tệp (ảnh, video, PDF)</span>
            </div>

            <div
              onClick={() => evidenceInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/60 p-3.5 rounded-2xl text-center cursor-pointer transition-colors"
            >
              <p className="text-xs font-bold text-emerald-900">
                + Thêm ảnh hiện trường hoàn trả mặt bằng / nước sạch / biên bản xử phạt
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">
                Ảnh JPEG/PNG/WEBP, clip MP4 hoặc tệp PDF biên bản vi phạm hành chính
              </p>
              <input
                ref={evidenceInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,application/pdf"
                onChange={handleEvidenceFilesChange}
                className="hidden"
              />
            </div>

            {/* Danh sách minh chứng đã chọn */}
            {evidenceFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {evidenceFiles.map((f, idx) => {
                  const isImage = f.type.startsWith('image/');
                  const isVideo = f.type.startsWith('video/');
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        {isImage ? (
                          <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isVideo ? (
                          <Film className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        )}
                        <span className="truncate font-medium text-slate-800">{f.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {(f.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEvidenceFile(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="Xóa tệp này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !conclusionText.trim()}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang ban hành kết luận...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Ban Hành & Chốt Kết Luận</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
