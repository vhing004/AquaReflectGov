import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Compass, 
  FileCheck, 
  FlaskConical, 
  FileText, 
  Trash2, 
  Eye, 
  Film, 
  Camera,
  Navigation
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

interface AddInspectionNoteModalProps {
  petitionId: string;
  trackingCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddInspectionNoteModal: React.FC<AddInspectionNoteModalProps> = ({
  petitionId,
  trackingCode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<number>(1); // 1: FieldObservation, 2: SiteVisitReport, 3: EvidenceCollection, 4: InternalNote
  const [fieldLatitude, setFieldLatitude] = useState<string>('');
  const [fieldLongitude, setFieldLongitude] = useState<string>('');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Lấy vị trí GPS hiện tại từ trình duyệt
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Trình duyệt không hỗ trợ định vị vị trí GPS.');
      return;
    }

    setIsGettingGps(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFieldLatitude(pos.coords.latitude.toFixed(6));
        setFieldLongitude(pos.coords.longitude.toFixed(6));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        let msg = 'Không thể lấy vị trí hiện tại.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Vui lòng cấp quyền truy cập vị trí cho trình duyệt.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Không tìm thấy tín hiệu định vị vệ tinh / mạng.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Thời gian chờ định vị quá hạn. Vui lòng thử lại.';
        }
        setErrorMessage(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (selectedFiles.length + newFiles.length > 5) {
      setErrorMessage('Chỉ được đính kèm tối đa 5 tệp cho mỗi lần lập biên bản / ghi chú.');
      return;
    }

    for (const f of newFiles) {
      if (f.size > 25 * 1024 * 1024) {
        setErrorMessage(`Tệp "${f.name}" vượt quá giới hạn 25MB.`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      setErrorMessage('Vui lòng nhập nội dung ghi chú / tóm tắt kết quả khảo sát thực địa.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('NoteContent', noteContent.trim());
      formData.append('NoteType', noteType.toString());

      if (fieldLatitude.trim()) {
        const lat = parseFloat(fieldLatitude.trim());
        if (!isNaN(lat)) formData.append('FieldLatitude', lat.toString());
      }

      if (fieldLongitude.trim()) {
        const lng = parseFloat(fieldLongitude.trim());
        if (!isNaN(lng)) formData.append('FieldLongitude', lng.toString());
      }

      selectedFiles.forEach((file) => {
        formData.append('Files', file);
      });

      const res = await adminApi.addInspectionNote(petitionId, formData);
      onSuccess(res.message || 'Đã lưu ghi chú / biên bản hiện trường thành công.');
      onClose();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            title?: string;
            errors?: Record<string, string[]>;
          };
        };
      };
      const responseData = axiosError?.response?.data;
      let detailedMsg = responseData?.message;
      if (!detailedMsg && responseData?.errors) {
        detailedMsg = Object.values(responseData.errors).flat().join(', ');
      }
      if (!detailedMsg && responseData?.title) {
        detailedMsg = responseData.title;
      }
      setErrorMessage(detailedMsg || 'Có lỗi xảy ra khi lưu ghi chú hiện trường.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const noteTypes = [
    {
      id: 1,
      name: 'Quan sát thực địa',
      icon: Eye,
      color: 'border-sky-300 text-sky-800 bg-sky-50/70',
      activeColor: 'border-sky-600 bg-sky-100 ring-2 ring-sky-500/20 text-sky-900',
      desc: 'Ghi nhận hiện trạng môi trường, nguồn nước, tình trạng nuôi trồng',
    },
    {
      id: 2,
      name: 'Biên bản kiểm tra',
      icon: FileCheck,
      color: 'border-emerald-300 text-emerald-800 bg-emerald-50/70',
      activeColor: 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-500/20 text-emerald-900',
      desc: 'Biên bản làm việc với cơ sở, chính quyền địa phương hoặc đương sự',
    },
    {
      id: 3,
      name: 'Thu thập mẫu / Chứng cứ',
      icon: FlaskConical,
      color: 'border-amber-300 text-amber-800 bg-amber-50/70',
      activeColor: 'border-amber-600 bg-amber-100 ring-2 ring-amber-500/20 text-amber-900',
      desc: 'Lấy mẫu nước, trầm tích, ghi hình tàu cá hoặc niêm phong tang vật',
    },
    {
      id: 4,
      name: 'Ghi chú nội bộ khác',
      icon: FileText,
      color: 'border-slate-300 text-slate-700 bg-slate-50',
      activeColor: 'border-slate-600 bg-slate-100 ring-2 ring-slate-400/20 text-slate-900',
      desc: 'Trao đổi, phối hợp liên ngành hoặc chỉ đạo nhanh',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004d77] via-[#006194] to-[#0284c7] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Compass className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Ghi Chú Khảo Sát Hiện Trường & Biên Bản Thực Địa
              </h2>
              <p className="text-xs text-sky-100">
                Hồ sơ: <strong className="font-mono font-bold text-white">{trackingCode}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Chọn loại biên bản/ghi chú */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              1. Phân loại nghiệp vụ thực địa <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {noteTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = noteType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNoteType(item.id)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected ? item.activeColor : item.color
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white/80 shrink-0 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold leading-tight">{item.name}</p>
                      <p className="text-[11px] opacity-80 leading-normal line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tọa độ GPS hiện trường */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#006194]" />
                <span className="text-xs font-bold text-slate-800">
                  2. Tọa độ GPS ghi nhận thực địa (WGS84)
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingGps}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                title="Bấm để tự động lấy tọa độ GPS từ cảm biến vị trí thiết bị"
              >
                {isGettingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{isGettingGps ? 'Đang định vị...' : 'Lấy vị trí hiện tại'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 10.776889"
                  value={fieldLatitude}
                  onChange={(e) => setFieldLatitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 106.700806"
                  value={fieldLongitude}
                  onChange={(e) => setFieldLongitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>

            {gpsAccuracy !== null && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Độ chính xác GPS vệ tinh: ±{gpsAccuracy} mét</span>
              </p>
            )}
          </div>

          {/* 3. Nội dung ghi chú / Biên bản */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                3. Nội dung khảo sát / Tóm tắt biên bản hiện trường <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {noteContent.length} ký tự
              </span>
            </div>
            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Ghi rõ: Tình hình quan sát thực địa, số lượng lồng bè kiểm tra, nồng độ pH/oxy đo nhanh, thành phần đoàn kiểm tra, ý kiến đương sự..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 4. Đính kèm tệp ảnh / video / PDF biên bản */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-sky-600" />
                <span>4. Ảnh chụp hiện trường & Biên bản đính kèm ({selectedFiles.length}/5)</span>
              </label>
              <span className="text-[11px] text-slate-400">Tối đa 5 tệp (JPG, PNG, MP4, PDF, ≤ 25MB)</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 p-4 rounded-2xl text-center cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-sky-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">
                Bấm vào đây để chọn tệp hoặc chụp ảnh từ máy ảnh thiết bị
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chấp nhận hình ảnh JPEG/PNG/WEBP, video clip MP4 hoặc tệp PDF biên bản đã ký
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Danh sách tệp đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {selectedFiles.map((f, idx) => {
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
                        onClick={() => removeFile(idx)}
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !noteContent.trim()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006194] to-[#0284c7] hover:from-[#004d77] hover:to-[#026aa0] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải lên & lưu vết...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Lưu Biên Bản Thực Địa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
