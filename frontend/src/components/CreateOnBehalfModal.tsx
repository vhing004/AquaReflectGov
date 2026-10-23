import React, { useState } from 'react';
import { X, PhoneCall, User, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { Category, AdministrativeUnit } from '../types';

interface CreateOnBehalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  adminUnits?: AdministrativeUnit[];
  onSuccess: (trackingCode: string) => void;
}

export const CreateOnBehalfModal: React.FC<CreateOnBehalfModalProps> = ({
  isOpen,
  onClose,
  categories,
  adminUnits: _adminUnits = [],
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [receptionSource, setReceptionSource] = useState<number>(1); // 1 = Phone
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenIdCard, setCitizenIdCard] = useState('');
  const [addressText, setAddressText] = useState('');
  const [adminUnitId] = useState<number | undefined>(undefined);
  const [priorityLevel, setPriorityLevel] = useState<number>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !citizenPhone.trim() || !citizenName.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('categoryId', categoryId || categories[0]?.id || '');
      formData.append('receptionSource', receptionSource.toString());
      formData.append('citizenName', citizenName.trim());
      formData.append('citizenPhone', citizenPhone.trim());
      if (citizenEmail.trim()) formData.append('citizenEmail', citizenEmail.trim());
      if (citizenIdCard.trim()) formData.append('citizenIdCard', citizenIdCard.trim());
      if (addressText.trim()) formData.append('addressText', addressText.trim());
      if (adminUnitId) formData.append('administrativeUnitId', adminUnitId.toString());
      formData.append('priorityLevel', priorityLevel.toString());

      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await adminApi.createOnBehalf(formData);
      if (res.data?.trackingCode) {
        onSuccess(res.data.trackingCode);
        onClose();
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosError?.response?.data?.message || 'Có lỗi xảy ra khi nhập hộ phản ánh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-3 bg-sky-50 text-[#006194] rounded-2xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tiếp Nhận Hộ Phản Ánh Kiến Nghị</h2>
            <p className="text-xs text-slate-500">
              Nhập thông tin phản ánh tiếp nhận qua điện thoại hotline, trực tiếp hoặc văn bản giấy
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nguồn tiếp nhận & Ưu tiên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nguồn tiếp nhận <span className="text-rose-500">*</span>
              </label>
              <select
                value={receptionSource}
                onChange={(e) => setReceptionSource(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50"
              >
                <option value={1}>1. Điện thoại / Đường dây nóng</option>
                <option value={2}>2. Trực tiếp tại bộ phận Một cửa</option>
                <option value={3}>3. Văn bản / Đơn thư chuyển đến</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50"
              >
                <option value={1}>Bình thường (Tiêu chuẩn)</option>
                <option value={2}>Ưu tiên cao</option>
                <option value={3}>Khẩn cấp</option>
              </select>
            </div>
          </div>

          {/* Thông tin người dân */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-[#006194]" />
              <span>Thông tin Người gửi phản ánh (Công dân / Cơ sở nuôi trồng)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Họ tên người dân <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Ngư"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email nhận thông báo</label>
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  placeholder="email@example.com (tùy chọn)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Số CCCD / Mã số tàu</label>
                <input
                  type="text"
                  value={citizenIdCard}
                  onChange={(e) => setCitizenIdCard(e.target.value)}
                  placeholder="Số CCCD hoặc số đăng ký tàu"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nội dung phản ánh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chuyên mục phản ánh <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#006194] bg-slate-50/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (SLA: {c.defaultSlaHours}h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề phản ánh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt ngắn gọn vấn đề phản ánh..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nội dung chi tiết phản ánh <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi lại chi tiết phản ánh của người dân..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194]"
              required
            />
          </div>

          {/* Địa bàn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa bàn / Vị trí xảy ra</label>
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="Ví dụ: Ấp Kinh Hòn, Xã Khánh Bình Tây, Huyện Trần Văn Thời"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#006194]"
            />
          </div>

          {/* Tệp đính kèm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tệp đính kèm / Văn bản scan (nếu có)</label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files));
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[#006194] hover:file:bg-sky-100"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Lưu & Tiếp nhận hồ sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
