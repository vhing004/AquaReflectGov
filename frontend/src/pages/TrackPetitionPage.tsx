import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { petitionApi } from '../api/petitionApi';
import type { PetitionTrackingDetail, PetitionSummary } from '../types';
import { 
  Search, 
  FileSearch, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Download, 
  Phone, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Copy, 
  Check, 
  Eye, 
  AlertCircle,
  Building2,
  Image as ImageIcon
} from 'lucide-react';

export const TrackPetitionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [searchMode, setSearchMode] = useState<'code' | 'phone'>('code');
  const [queryInput, setQueryInput] = useState(initialCode || 'TS-202609-HGZH4');
  const [phoneVerification, setPhoneVerification] = useState('');

  // States for Code search result
  const [trackingDetail, setTrackingDetail] = useState<PetitionTrackingDetail | null>(null);
  // States for Phone search result
  const [phoneResults, setPhoneResults] = useState<PetitionSummary[] | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-search if query param 'code' is present
  useEffect(() => {
    if (initialCode) {
      handleSearchCode(initialCode);
    }
  }, [initialCode]);

  const handleSearchCode = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) {
      setErrorMessage('Vui lòng nhập mã hồ sơ tra cứu (ví dụ: TS-202609-HGZH4).');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setPhoneResults(null);

      const res = await petitionApi.trackPetition(codeToSearch.trim(), phoneVerification || undefined);
      if (res.success && res.data) {
        setTrackingDetail(res.data);
        setSearchParams({ code: codeToSearch.trim() });
      } else {
        setErrorMessage(res.message || 'Không tìm thấy thông tin hồ sơ.');
        setTrackingDetail(null);
      }
    } catch (err: any) {
      setTrackingDetail(null);
      const msg = err.response?.data?.message || 'Không tìm thấy hồ sơ phản ánh với mã đã cung cấp. Vui lòng kiểm tra lại.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPhone = async (phoneToSearch: string) => {
    if (!phoneToSearch.trim() || phoneToSearch.trim().length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9-10 chữ số).');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setTrackingDetail(null);

      const res = await petitionApi.getPetitionsByPhone(phoneToSearch.trim());
      if (res.success && res.data) {
        setPhoneResults(res.data);
        if (res.data.length === 0) {
          setErrorMessage(`Không tìm thấy hồ sơ nào liên kết với số điện thoại ${phoneToSearch}.`);
        }
      } else {
        setErrorMessage(res.message || 'Lỗi tra cứu hồ sơ theo số điện thoại.');
      }
    } catch (err: any) {
      setPhoneResults(null);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu theo số điện thoại.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'code') {
      handleSearchCode(queryInput);
    } else {
      handleSearchPhone(queryInput);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper for Stepper stages
  const getStepStatus = (stepIndex: number, currentStatus: number) => {
    // 1: Submitted, 2: Assigned, 3: Investigating, 4: Resolved
    if (currentStatus >= stepIndex) return 'completed';
    if (currentStatus === stepIndex - 1) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. HEADER HERO */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-wider uppercase bg-sky-50 text-[#006194] px-3 py-1 rounded-full border border-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006194]" />
          <span>Cổng Tra Cứu Trực Tuyến 24 Tỉnh/Thành Ven Biển</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Theo Dõi & Tra Cứu Tiến Độ Giải Quyết Phản Ánh
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Nhập mã biên nhận điện tử hoặc số điện thoại người gửi để kiểm tra lộ trình thẩm tra hiện trường, nhật ký xử lý nghiệp vụ và tải về văn bản kết luận chính thức.
        </p>
      </div>

      {/* 2. SEARCH BOX WITH TAB SWITCH */}
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setSearchMode('code');
              setQueryInput('TS-202609-HGZH4');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              searchMode === 'code'
                ? 'bg-white text-[#006194] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Theo Mã Biên Nhận (Tracking Code)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchMode('phone');
              setQueryInput('0912345678');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              searchMode === 'phone'
                ? 'bg-white text-[#006194] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Theo Số Điện Thoại Người Gửi</span>
          </button>
        </div>

        {/* Form input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {searchMode === 'code' ? 'Nhập mã biên nhận hồ sơ' : 'Nhập số điện thoại đã nộp phản ánh'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {searchMode === 'code' ? (
                  <FileSearch className="w-5 h-5 text-[#006194]" />
                ) : (
                  <Phone className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <input
                type="text"
                required
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  searchMode === 'code'
                    ? 'Ví dụ: TS-202609-HGZH4 hoặc #TS-...'
                    : 'Ví dụ: 0912 345 678'
                }
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 uppercase"
              />
            </div>
          </div>

          {searchMode === 'code' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Số điện thoại liên hệ (tùy chọn - dùng để xác thực quyền xem hồ sơ bảo mật)
              </label>
              <input
                type="tel"
                value={phoneVerification}
                onChange={(e) => setPhoneVerification(e.target.value)}
                placeholder="Nhập SĐT đã gửi phản ánh nếu cần xác thực"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006194]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#006194] hover:bg-[#0284c7] disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang truy xuất dữ liệu sổ bộ...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Tra Cứu Tiến Độ Ngay</span>
              </>
            )}
          </button>
        </form>

        {/* Quick hint */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Gợi ý tra cứu nhanh:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setSearchMode('code');
                setQueryInput('TS-202609-HGZH4');
                handleSearchCode('TS-202609-HGZH4');
              }}
              className="text-[#006194] font-bold hover:underline"
            >
              TS-202609-HGZH4
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchMode('code');
                setQueryInput('TS-202609-FUYA9');
                handleSearchCode('TS-202609-FUYA9');
              }}
              className="text-[#006194] font-bold hover:underline"
            >
              TS-202609-FUYA9
            </button>
          </div>
        </div>
      </div>

      {/* 3. ERROR BANNER */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-800">Không tìm thấy kết quả</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 4. RESULT PANEL - SINGLE PETITION DETAIL (SEARCH BY CODE) */}
      {trackingDetail && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* A. HEADER RESULT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xl font-black text-[#006194]">
                  #{trackingDetail.trackingCode}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  trackingDetail.status === 4 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : trackingDetail.status === 5
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {trackingDetail.statusName}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  trackingDetail.priorityLevel === 3
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Ưu tiên: {trackingDetail.priorityName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-snug">
                {trackingDetail.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(trackingDetail.trackingCode)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã chép' : 'Sao chép mã'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold hover:bg-[#0284c7] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In phiếu</span>
              </button>
            </div>
          </div>

          {/* B. THÔNG TIN SLA & HẠN GIẢI QUYẾT */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời điểm gửi</span>
              <div className="flex items-center space-x-1.5 mt-1 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(trackingDetail.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Quy định SLA</span>
              <div className="flex items-center space-x-1.5 mt-1 font-bold text-sky-700">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>{trackingDetail.defaultSlaHours} Giờ làm việc</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạn chót giải quyết</span>
              <div className="flex items-center space-x-1.5 mt-1 font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {trackingDetail.dueDate 
                    ? new Date(trackingDetail.dueDate).toLocaleString('vi-VN') 
                    : 'Chưa xác định'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tình trạng thời hạn</span>
              <div className="mt-1">
                {trackingDetail.status === 4 || trackingDetail.status === 6 ? (
                  <span className="font-bold text-emerald-700">Đã hoàn tất đúng hạn</span>
                ) : trackingDetail.isOverdue ? (
                  <span className="font-bold text-rose-700 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Quá hạn quy định</span>
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700">
                    Còn {trackingDetail.remainingHours ?? 0} giờ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* C. TIẾN ĐỘ 4 BƯỚC THẨM TRA & GIẢI QUYẾT (STEPPER) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#006194]">
                Lộ trình 4 bước giải quyết của cơ quan chức năng
              </h3>
              <span className="text-[11px] text-slate-400">Cập nhật tức thời từ sổ bộ điện tử</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Bước 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                getStepStatus(1, trackingDetail.status) === 'completed'
                  ? 'bg-sky-50/60 border-sky-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#006194] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span className="font-bold text-xs text-slate-900">1. Tiếp nhận & Vào sổ</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Bộ phận một cửa kiểm tra tính hợp lệ và cấp mã hồ sơ số.
                </p>
              </div>

              {/* Bước 2 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                getStepStatus(2, trackingDetail.status) === 'completed'
                  ? 'bg-sky-50/60 border-sky-200'
                  : trackingDetail.status === 2 || trackingDetail.status === 1
                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    trackingDetail.status >= 2 ? 'bg-[#006194] text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {trackingDetail.status >= 2 ? '✓' : '2'}
                  </div>
                  <span className="font-bold text-xs text-slate-900">2. Khảo sát thực địa</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Cán bộ kiểm ngư/môi trường kiểm tra tọa độ hải trình, đo mẫu nước.
                </p>
              </div>

              {/* Bước 3 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                getStepStatus(3, trackingDetail.status) === 'completed'
                  ? 'bg-sky-50/60 border-sky-200'
                  : trackingDetail.status === 3
                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    trackingDetail.status >= 3 ? 'bg-[#006194] text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {trackingDetail.status >= 3 ? '✓' : '3'}
                  </div>
                  <span className="font-bold text-xs text-slate-900">3. Phối hợp xử lý</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Phối hợp BQL cảng cá, Đồn Biên phòng và UBND địa phương kết luận.
                </p>
              </div>

              {/* Bước 4 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                trackingDetail.status === 4 || trackingDetail.status === 6
                  ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    trackingDetail.status >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {trackingDetail.status >= 4 ? '✓' : '4'}
                  </div>
                  <span className="font-bold text-xs text-slate-900">4. Ban hành quyết định</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Ký duyệt văn bản trả lời, công khai kết quả và lưu trữ hồ sơ.
                </p>
              </div>
            </div>
          </div>

          {/* D. NỘI DUNG CHI TIẾT & ĐƠN VỊ THỤ LÝ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Cột trái: Nội dung và Minh chứng */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Nội dung phản ánh chi tiết
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {trackingDetail.content}
                </div>
              </div>

              {/* Tệp đính kèm hiện trường */}
              {trackingDetail.attachments && trackingDetail.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Tệp minh chứng thực địa ({trackingDetail.attachments.length} tệp)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trackingDetail.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-[#006194] hover:shadow-xs transition-all text-xs group"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#006194] flex items-center justify-center shrink-0">
                            {file.fileType === 'Photo' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate group-hover:text-[#006194] max-w-[170px]">
                              {file.originalFileName || file.fileName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {(((file.fileSize ?? file.fileSizeBytes ?? 0)) / 1024).toFixed(0)} KB • {file.fileType || 'Tài liệu'}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-[#006194]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quyết định giải quyết (nếu có) */}
              {trackingDetail.resolution && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Kết Luận & Quyết Định Giải Quyết Chính Thức</span>
                  </div>
                  <p className="text-xs text-emerald-950 whitespace-pre-wrap">
                    {trackingDetail.resolution.conclusionText}
                  </p>
                  {trackingDetail.resolution.officialDocumentUrl && (
                    <a
                      href={trackingDetail.resolution.officialDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về Văn bản số {trackingDetail.resolution.documentNumber || 'QĐ-CCTS'} (PDF)</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Cột phải: Thông tin đơn vị & Người gửi */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Chuyên mục</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trackingDetail.categoryName}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cơ quan phụ trách giải quyết</span>
                  <p className="font-bold text-[#006194] mt-0.5 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-[#006194] shrink-0" />
                    <span>{trackingDetail.departmentName}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Địa bàn hành chính</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{trackingDetail.administrativeUnitName || '28 tỉnh ven biển'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vị trí thực địa</span>
                  <p className="text-slate-700 mt-0.5 flex items-start space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{trackingDetail.addressText}</span>
                  </p>
                  {trackingDetail.latitude && trackingDetail.longitude && (
                    <span className="font-mono text-[10px] text-slate-500 block pl-4.5 mt-0.5">
                      GPS: {trackingDetail.latitude}°N, {trackingDetail.longitude}°E
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thông tin người nộp</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trackingDetail.citizenNameMasked}</p>
                  {trackingDetail.citizenPhoneMasked && (
                    <p className="text-slate-500 text-[11px]">SĐT: {trackingDetail.citizenPhoneMasked}</p>
                  )}
                  {trackingDetail.isAnonymous && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Hồ sơ bảo mật danh tính
                    </span>
                  )}
                </div>
              </div>

              {/* Dòng thời gian nhật ký chi tiết */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Nhật ký xử lý chi tiết ({trackingDetail.timeline.length})
                </span>

                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                  {trackingDetail.timeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative text-xs">
                      <div className="absolute -left-5 mt-1 w-2.5 h-2.5 rounded-full bg-[#006194] ring-4 ring-sky-100"></div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Thực hiện bởi: <span className="font-semibold text-slate-700">{item.actorName}</span>
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 italic">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RESULT PANEL - MULTIPLE PETITIONS LIST (SEARCH BY PHONE) */}
      {phoneResults && phoneResults.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
                Hồ sơ đã gửi từ số điện thoại
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Tìm thấy {phoneResults.length} phản ánh kiến nghị
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Nhấn vào từng hồ sơ để xem chi tiết
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phoneResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSearchMode('code');
                  setQueryInput(item.trackingCode);
                  handleSearchCode(item.trackingCode);
                }}
                className="p-5 rounded-2xl border border-slate-200 hover:border-[#006194] hover:shadow-md transition-all cursor-pointer bg-slate-50/40 hover:bg-sky-50/20 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#006194] group-hover:underline">
                    #{item.trackingCode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 4 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {item.statusName}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold text-[#006194]">
                    <span>Xem tiến độ</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
