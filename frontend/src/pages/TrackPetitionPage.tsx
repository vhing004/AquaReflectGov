import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
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
  Image as ImageIcon,
  QrCode,
  Share2,
  X,
  History,
  Sparkles,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const LOCAL_STORAGE_RECENT_KEY = 'aquareflect_recent_searches';

interface RecentSearchItem {
  type: 'code' | 'phone';
  value: string;
  timestamp: string;
}

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

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  // QR Code Modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Image Lightbox Modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Filter & Search state for Phone Results
  const [phoneFilterStatus, setPhoneFilterStatus] = useState<string>('all');
  const [phoneSearchText, setPhoneSearchText] = useState<string>('');
  const [phoneSortOrder, setPhoneSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load recent searches on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (raw) {
        setRecentSearches(JSON.parse(raw));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save to recent searches
  const saveRecentSearch = (type: 'code' | 'phone', value: string) => {
    try {
      const trimmed = value.trim().toUpperCase();
      const existing = recentSearches.filter((item) => item.value !== trimmed);
      const updated: RecentSearchItem[] = [
        { type, value: trimmed, timestamp: new Date().toISOString() },
        ...existing,
      ].slice(0, 5); // Keep at most 5

      setRecentSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
  };

  // Auto-search if query param 'code' is present
  useEffect(() => {
    if (initialCode) {
      handleSearchCode(initialCode);
    }
  }, [initialCode]);

  // Generate QR code when trackingDetail changes
  useEffect(() => {
    if (trackingDetail) {
      const trackUrl = `${window.location.origin}/track?code=${encodeURIComponent(trackingDetail.trackingCode)}`;
      QRCode.toDataURL(trackUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#006194',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Lỗi tạo mã QR:', err));
    }
  }, [trackingDetail]);

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
        saveRecentSearch('code', codeToSearch.trim());
      } else {
        setErrorMessage(res.message || 'Không tìm thấy thông tin hồ sơ.');
        setTrackingDetail(null);
      }
    } catch (err: any) {
      setTrackingDetail(null);
      const msg = err.response?.data?.message || 'Không tìm thấy hồ sơ phản ánh với mã đã cung cấp. Vui lòng kiểm tra lại tính chính xác của mã hồ sơ.';
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
        saveRecentSearch('phone', phoneToSearch.trim());
        if (res.data.length === 0) {
          setErrorMessage(`Không tìm thấy hồ sơ nào liên kết với số điện thoại ${phoneToSearch}.`);
        }
      } else {
        setErrorMessage(res.message || 'Lỗi tra cứu hồ sơ theo số điện thoại.');
      }
    } catch (err: any) {
      setPhoneResults(null);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu theo số điện thoại. Vui lòng thử lại sau.';
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

  const copyTrackLink = () => {
    if (!trackingDetail) return;
    const link = `${window.location.origin}/track?code=${encodeURIComponent(trackingDetail.trackingCode)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadQrPng = () => {
    if (!qrCodeDataUrl || !trackingDetail) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `QR_AquaReflect_${trackingDetail.trackingCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!trackingDetail) return;
    const shareUrl = `${window.location.origin}/track?code=${encodeURIComponent(trackingDetail.trackingCode)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tra cứu phản ánh ${trackingDetail.trackingCode} - Cục Thủy Sản`,
          text: `Theo dõi tiến độ giải quyết phản ánh: ${trackingDetail.title}`,
          url: shareUrl,
        });
      } catch {
        copyTrackLink();
      }
    } else {
      copyTrackLink();
    }
  };

  // 4-Phase Stepper Status Helper
  // Phase 1: Tiếp nhận (Status >= 1)
  // Phase 2: Đang xử lý & Thẩm tra (Status >= 2)
  // Phase 3: Kết quả & Quyết định (Status >= 4)
  // Phase 4: Đánh giá & Lưu trữ (Status >= 6 hoặc HasFeedback)
  const getPhaseInfo = (status: number, hasFeedback?: boolean) => {
    let activePhase = 1;
    let progressPercent = 25;

    if (status === 1) {
      activePhase = 1;
      progressPercent = 25;
    } else if (status === 2 || status === 3) {
      activePhase = 2;
      progressPercent = status === 2 ? 45 : 65;
    } else if (status === 4) {
      activePhase = 3;
      progressPercent = hasFeedback ? 100 : 85;
    } else if (status === 6) {
      activePhase = 4;
      progressPercent = 100;
    } else if (status === 5) {
      activePhase = 0; // Rejected
      progressPercent = 100;
    }

    return { activePhase, progressPercent };
  };

  // Filter & Search for Phone Results
  const filteredPhoneResults = (phoneResults || []).filter((item) => {
    // Status filter
    if (phoneFilterStatus === 'processing' && (item.status === 4 || item.status === 6)) return false;
    if (phoneFilterStatus === 'resolved' && (item.status !== 4 && item.status !== 6)) return false;
    if (phoneFilterStatus === 'urgent' && item.priorityLevel !== 3) return false;

    // Search text filter
    if (phoneSearchText.trim()) {
      const q = phoneSearchText.toLowerCase();
      const matchCode = item.trackingCode.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.categoryName.toLowerCase().includes(q);
      return matchCode || matchTitle || matchCat;
    }

    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return phoneSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. BREADCRUMB & BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3 print:hidden">
        <div className="flex items-center space-x-1.5 font-medium">
          <Link to="/" className="text-[#006194] font-bold hover:underline">Cổng DVC Thủy Sản</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">Tra Cứu & Nhật Ký Tiến Độ</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dữ liệu trực tuyến từ Chi cục Thủy sản 28 tỉnh ven biển</span>
        </div>
      </div>

      {/* 2. HEADER HERO */}
      <div className="text-center space-y-2.5 print:hidden">
        <span className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-wider uppercase bg-sky-50 text-[#006194] px-3 py-1 rounded-full border border-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006194]" />
          <span>Hệ Thống Theo Dõi Minh Bạch Hồ Sơ Thủy Sản</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tra Cứu Tiến Độ & Kết Quả Giải Quyết Phản Ánh
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Kiểm tra trực tuyến quy trình 4 giai đoạn từ tiếp nhận, thẩm tra thực địa, giám sát hải trình VMS đến quyết định kết luận chính thức có số hiệu đóng dấu.
        </p>
      </div>

      {/* 3. SEARCH BOX WITH TAB SWITCH */}
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5 print:hidden">
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
              {searchMode === 'code' ? 'Nhập mã biên nhận hồ sơ' : 'Nhập số điện thoại đã gửi phản ánh'}
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
                    ? 'Ví dụ: TS-202609-HGZH4 hoặc TS-...'
                    : 'Ví dụ: 0912 345 678'
                }
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 uppercase shadow-2xs"
              />
            </div>
          </div>

          {searchMode === 'code' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Số điện thoại liên hệ (tùy chọn - dùng để xác thực nếu hồ sơ bảo mật)
              </label>
              <input
                type="tel"
                value={phoneVerification}
                onChange={(e) => setPhoneVerification(e.target.value)}
                placeholder="Nhập SĐT để xác minh quyền tra cứu"
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

        {/* LỊCH SỬ TRA CỨU GẦN ĐÂY HOẶC GỢI Ý MẪU */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {recentSearches.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Lịch sử tra cứu gần đây:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchMode(item.type);
                      setQueryInput(item.value);
                      if (item.type === 'code') {
                        handleSearchCode(item.value);
                      } else {
                        handleSearchPhone(item.value);
                      }
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#006194] font-mono text-[11px] font-bold border border-sky-100 transition-colors"
                  >
                    <span>{item.value}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-slate-400 hover:text-rose-500 text-[11px] ml-1 transition-colors"
                  title="Xóa lịch sử tra cứu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Hồ sơ mẫu tiêu biểu:</span>
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
                  TS-202609-HGZH4 (IUU Sa Kỳ)
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
                  TS-202609-FUYA9 (Ô nhiễm nước)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. ERROR BANNER */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-800">Không tìm thấy kết quả phù hợp</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 5. RESULT PANEL - CHI TIẾT 1 HỒ SƠ (TRA CỨU THEO MÃ BIÊN NHẬN)   */}
      {/* ================================================================ */}
      {trackingDetail && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* A. HEADER KẾT QUẢ & CÁC NÚT THAO TÁC */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 print:hidden">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#006194]">
                  #{trackingDetail.trackingCode}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  trackingDetail.status === 4 || trackingDetail.status === 6
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

            {/* ACTION BUTTONS: QR, SHARE, PRINT, COPY */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-sky-50 text-[#006194] hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-colors"
                title="Xem mã QR hồ sơ"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mã QR</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Chia sẻ liên kết tra cứu"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedLink ? 'Đã chép link' : 'Chia sẻ'}</span>
              </button>

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
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold hover:bg-[#0284c7] transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In phiếu</span>
              </button>
            </div>
          </div>

          {/* B. BẢNG TIẾN TRÌNH 4 GIAI ĐOẠN LIÊN KẾT (ENHANCED STEPPER) */}
          {(() => {
            const { activePhase, progressPercent } = getPhaseInfo(trackingDetail.status, trackingDetail.hasFeedback);
            return (
              <div className="space-y-4 bg-slate-50/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#006194] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quy Trình 4 Giai Đoạn Thẩm Tra & Giải Quyết Phản Ánh</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tiến độ hoàn thành: <strong className="text-slate-800">{progressPercent}%</strong> • Đồng bộ từ Sổ bộ Điện tử Cục Thủy Sản
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                    Trạng thái: <span className="text-[#006194]">{trackingDetail.statusName}</span>
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#006194] via-sky-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* 4 Cards for 4 Phases */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Phase 1: Tiếp nhận */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    activePhase >= 1 
                      ? 'bg-white border-sky-300 ring-1 ring-sky-200 shadow-2xs' 
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#006194] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        ✓
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Đã xong
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-2.5">
                      1. Tiếp nhận & Vào sổ
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tiếp nhận hồ sơ, kiểm tra tính hợp lệ và cấp mã số bộ.
                    </p>
                  </div>

                  {/* Phase 2: Đang xử lý & Thẩm tra */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    activePhase >= 2
                      ? activePhase === 2
                        ? 'bg-white border-amber-400 ring-2 ring-amber-200 shadow-xs'
                        : 'bg-white border-sky-300 ring-1 ring-sky-200 shadow-2xs'
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        activePhase > 2 ? 'bg-[#006194] text-white' : activePhase === 2 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {activePhase > 2 ? '✓' : '2'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        activePhase > 2 ? 'text-emerald-700 bg-emerald-50' : activePhase === 2 ? 'text-amber-800 bg-amber-100' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {activePhase > 2 ? 'Đã xong' : activePhase === 2 ? 'Đang xử lý' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-2.5">
                      2. Thẩm tra & Giám sát
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kiểm tra thực địa, trích xuất dữ liệu VMS, đo mẫu nước.
                    </p>
                  </div>

                  {/* Phase 3: Kết quả & Quyết định */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    activePhase >= 3
                      ? 'bg-white border-emerald-400 ring-1 ring-emerald-200 shadow-2xs'
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        activePhase >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {activePhase >= 3 ? '✓' : '3'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        activePhase >= 3 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {activePhase >= 3 ? 'Đã ban hành' : 'Chờ kết luận'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-2.5">
                      3. Quyết định & Kết luận
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ban hành văn bản giải quyết có số hiệu đóng dấu.
                    </p>
                  </div>

                  {/* Phase 4: Đánh giá & Lưu trữ */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    activePhase >= 4 || trackingDetail.hasFeedback
                      ? 'bg-white border-emerald-400 ring-1 ring-emerald-200 shadow-2xs'
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        trackingDetail.hasFeedback ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trackingDetail.hasFeedback ? '✓' : '4'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        trackingDetail.hasFeedback ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {trackingDetail.hasFeedback ? 'Đã đánh giá' : 'Mở đánh giá'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-2.5">
                      4. Đánh giá hài lòng
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Khảo sát mức độ hài lòng của công dân/ngư dân.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* C. THÔNG TIN THỜI HẠN SLA & ĐỒNG HỒ ĐẾM NGƯỢC */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời điểm tiếp nhận</span>
              <div className="flex items-center space-x-1.5 mt-1 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(trackingDetail.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Quy định thời hạn (SLA)</span>
              <div className="flex items-center space-x-1.5 mt-1 font-bold text-sky-700">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>{trackingDetail.defaultSlaHours} Giờ làm việc</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạn chót cam kết giải quyết</span>
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
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tình trạng thời hạn xử lý</span>
              <div className="mt-1">
                {trackingDetail.status === 4 || trackingDetail.status === 6 ? (
                  <span className="font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã giải quyết đúng hạn</span>
                  </span>
                ) : trackingDetail.isOverdue ? (
                  <span className="font-bold text-rose-700 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Quá hạn quy định</span>
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Còn {trackingDetail.remainingHours ?? 0} giờ làm việc</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* D. NỘI DUNG CHI TIẾT & MINH CHỨNG HIỆN TRƯỜNG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột trái (7 cols): Nội dung, Tệp minh chứng, Quyết định giải quyết */}
            <div className="lg:col-span-7 space-y-6">
              {/* Nội dung phản ánh */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Nội dung phản ánh chi tiết
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {trackingDetail.content}
                </div>
              </div>

              {/* Tệp minh chứng thực địa (Hỗ trợ Lightbox xem trực tiếp) */}
              {trackingDetail.attachments && trackingDetail.attachments.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Tệp minh chứng hiện trường ({trackingDetail.attachments.length} tệp)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trackingDetail.attachments.map((file) => {
                      const isImage = file.fileType === 'Photo' || (file.mimeType && file.mimeType.startsWith('image/')) || file.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i);
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#006194] hover:shadow-xs transition-all text-xs group"
                        >
                          <div 
                            className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer"
                            onClick={() => {
                              if (isImage) {
                                setPreviewImage({ url: file.fileUrl, title: file.originalFileName || file.fileName });
                              } else {
                                window.open(file.fileUrl, '_blank');
                              }
                            }}
                          >
                            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#006194] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate group-hover:text-[#006194] max-w-[150px]">
                                {file.originalFileName || file.fileName}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {(((file.fileSize ?? file.fileSizeBytes ?? 0)) / 1024).toFixed(0)} KB • {file.fileType || 'Tài liệu'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            {isImage && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ url: file.fileUrl, title: file.originalFileName || file.fileName })}
                                className="p-1.5 text-slate-400 hover:text-[#006194] rounded-lg hover:bg-sky-50 transition-colors"
                                title="Xem trước ảnh"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <a
                              href={file.fileUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-[#006194] rounded-lg hover:bg-sky-50 transition-colors"
                              title="Tải về máy"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VĂN BẢN QUYẾT ĐỊNH GIẢI QUYẾT CHÍNH THỨC */}
              {trackingDetail.resolution && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Kết Luận & Quyết Định Giải Quyết Chính Thức</span>
                  </div>
                  <p className="text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
                    {trackingDetail.resolution.conclusionText}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-emerald-800">
                      Người ký duyệt: <strong>{trackingDetail.resolution.approvedByName || 'Lãnh đạo Chi cục Thủy sản'}</strong> • Ngày ban hành: {new Date(trackingDetail.resolution.issuedAt).toLocaleDateString('vi-VN')}
                    </span>
                    {trackingDetail.resolution.officialDocumentUrl && (
                      <a
                        href={trackingDetail.resolution.officialDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về Văn bản số {trackingDetail.resolution.documentNumber || 'QĐ-CCTS'} (PDF)</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* KHỐI ĐÁNH GIÁ MỨC ĐỘ HÀI LÒNG CỦA CÔNG DÂN (KẾT NỐI SANG TASK 2.5) */}
              {(trackingDetail.status === 4 || trackingDetail.status === 6) && (
                <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#006194] uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Đánh Giá Mức Độ Hài Lòng Của Người Dân</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {trackingDetail.hasFeedback ? 'Đã hoàn tất đánh giá' : 'Mở cổng tiếp nhận'}
                    </span>
                  </div>

                  {trackingDetail.hasFeedback ? (
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-sky-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">Điểm đánh giá:</span>
                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-base ${i < (trackingDetail.feedbackRating || 5) ? 'text-amber-400' : 'text-slate-200'}`}>
                              ★
                            </span>
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">({trackingDetail.feedbackRating}/5 sao)</span>
                        </div>
                      </div>
                      {trackingDetail.feedbackComment && (
                        <p className="text-[11px] text-slate-600 italic">
                          "{trackingDetail.feedbackComment}"
                        </p>
                      )}
                      <p className="text-[10px] text-emerald-700 font-medium">
                        ✓ Cục Thủy Sản trân trọng cảm ơn ý kiến đóng góp quý báu của bà con ngư dân!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-sky-100">
                      <div>
                        <p className="font-bold text-slate-900">Bạn có hài lòng với kết quả giải quyết này?</p>
                        <p className="text-[11px] text-slate-500">Ý kiến của bạn giúp cơ quan chức năng nâng cao chất lượng phục vụ.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert('Chức năng đánh giá trực tuyến 5 sao (Task 2.5) sẽ sẵn sàng ngay sau khi kích hoạt!')}
                        className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
                      >
                        Gửi Đánh Giá Ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cột phải (5 cols): Thông tin cơ quan, người nộp, dòng thời gian nhật ký */}
            <div className="lg:col-span-5 space-y-5">
              {/* Hộp thông tin cơ quan thụ lý & địa bàn */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lĩnh vực phản ánh</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trackingDetail.categoryName}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cơ quan phụ trách thụ lý</span>
                  <p className="font-bold text-[#006194] mt-0.5 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-[#006194] shrink-0" />
                    <span>{trackingDetail.departmentName}</span>
                  </p>
                </div>

                {trackingDetail.assignedUserName && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cán bộ trực tiếp thụ lý</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{trackingDetail.assignedUserName}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Địa bàn hành chính</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{trackingDetail.administrativeUnitName || '28 tỉnh ven biển'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vị trí thực địa</span>
                  <p className="text-slate-700 mt-0.5 flex items-start space-x-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{trackingDetail.addressText}</span>
                  </p>
                  {trackingDetail.latitude && trackingDetail.longitude && (
                    <span className="font-mono text-[10px] text-slate-500 block pl-5 mt-0.5">
                      GPS: {trackingDetail.latitude}°N, {trackingDetail.longitude}°E
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thông tin người nộp hồ sơ</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trackingDetail.citizenNameMasked}</p>
                  {trackingDetail.citizenPhoneMasked && (
                    <p className="text-slate-500 text-[11px] mt-0.5">SĐT: {trackingDetail.citizenPhoneMasked}</p>
                  )}
                  {trackingDetail.isAnonymous && (
                    <span className="inline-block mt-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Hồ sơ bảo mật danh tính người báo
                    </span>
                  )}
                </div>
              </div>

              {/* DÒNG THỜI GIAN NHẬT KÝ CHI TIẾT (AUDIT TIMELINE) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                    Nhật Ký Xử Lý Chi Tiết ({trackingDetail.timeline.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Ghi vết tự động</span>
                </div>

                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                  {trackingDetail.timeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative text-xs">
                      <div className="absolute -left-5 mt-1 w-2.5 h-2.5 rounded-full bg-[#006194] ring-4 ring-sky-100"></div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Thực hiện bởi: <span className="font-semibold text-slate-700">{item.actorName}</span>
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 italic">
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

      {/* ================================================================ */}
      {/* 6. RESULT PANEL - DANH SÁCH HỒ SƠ THEO SĐT (BỘ LỌC NÂNG CAO)    */}
      {/* ================================================================ */}
      {phoneResults && phoneResults.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
                Hồ sơ liên kết số điện thoại
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Tìm thấy {phoneResults.length} phản ánh kiến nghị
              </h2>
            </div>

            {/* SORT & COUNT */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Sắp xếp:</span>
              <select
                value={phoneSortOrder}
                onChange={(e) => setPhoneSortOrder(e.target.value as 'desc' | 'asc')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#006194]"
              >
                <option value="desc">Mới nhất trước</option>
                <option value="asc">Cũ nhất trước</option>
              </select>
            </div>
          </div>

          {/* BỘ LỌC TRẠNG THÁI & TÌM KIẾM NHANH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPhoneFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  phoneFilterStatus === 'all'
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({phoneResults.length})
              </button>
              <button
                type="button"
                onClick={() => setPhoneFilterStatus('processing')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  phoneFilterStatus === 'processing'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đang xử lý ({phoneResults.filter(r => r.status < 4).length})
              </button>
              <button
                type="button"
                onClick={() => setPhoneFilterStatus('resolved')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  phoneFilterStatus === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đã giải quyết ({phoneResults.filter(r => r.status === 4 || r.status === 6).length})
              </button>
              <button
                type="button"
                onClick={() => setPhoneFilterStatus('urgent')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  phoneFilterStatus === 'urgent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Khẩn cấp / Hỏa tốc ({phoneResults.filter(r => r.priorityLevel === 3).length})
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phoneSearchText}
                onChange={(e) => setPhoneSearchText(e.target.value)}
                placeholder="Lọc mã hoặc tiêu đề..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006194]"
              />
            </div>
          </div>

          {/* LƯỚI DANH SÁCH HỒ SƠ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPhoneResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSearchMode('code');
                  setQueryInput(item.trackingCode);
                  handleSearchCode(item.trackingCode);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                className="p-5 rounded-2xl border border-slate-200 hover:border-[#006194] hover:shadow-md transition-all cursor-pointer bg-slate-50/40 hover:bg-sky-50/20 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#006194] group-hover:underline">
                    #{item.trackingCode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 4 || item.status === 6
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {item.statusName}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#006194] transition-colors">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold text-[#006194]">
                    <span>Xem lộ trình chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 7. MODAL MÃ QR TRA CỨU HỒ SƠ (DÙNG ĐỂ QUÉT BẰNG ĐIỆN THOẠI)     */}
      {/* ================================================================ */}
      {showQrModal && trackingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006194]">
                Mã QR Tra Cứu Điện Tử
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-sm font-black text-[#006194]">
                #{trackingDetail.trackingCode}
              </span>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {trackingDetail.title}
              </p>
            </div>

            {/* QR Image Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code ${trackingDetail.trackingCode}`}
                  className="w-56 h-56 mx-auto rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-[#006194]" />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Quét bằng máy ảnh điện thoại hoặc ứng dụng Zalo để mở ngay trang theo dõi tiến độ.
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={downloadQrPng}
                className="flex-1 py-2 px-3 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh QR</span>
              </button>
              <button
                type="button"
                onClick={copyTrackLink}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center space-x-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép link' : 'Chép link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 8. MODAL LIGHTBOX XEM ẢNH MINH CHỨNG HIỆN TRƯỜNG PHÓNG TO        */}
      {/* ================================================================ */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 space-y-3 p-4">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold truncate max-w-[80%]">
                {previewImage.title}
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={previewImage.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Tải ảnh về máy"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl bg-black">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 9. MẪU IN PHIẾU THEO DÕI HÀNH CHÍNH CHUẨN (@media print)        */}
      {/* ================================================================ */}
      {trackingDetail && (
        <div className="hidden print:block text-black p-8 max-w-2xl mx-auto space-y-6 font-serif">
          <div className="text-center space-y-1 border-b-2 border-black pb-4">
            <p className="text-xs uppercase font-bold tracking-widest">
              BỘ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN - CỤC THỦY SẢN
            </p>
            <p className="text-xs font-bold">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[11px] italic">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-32 h-0.5 bg-black mx-auto my-2"></div>
            <h2 className="text-base font-bold uppercase mt-2">
              PHIẾU THEO DÕI TIẾN ĐỘ GIẢI QUYẾT PHẢN ÁNH THỦY SẢN
            </h2>
            <p className="text-[10px] italic">
              (Theo Biểu mẫu số 04B / CVC-BCH - Cổng Dịch vụ công Thủy sản)
            </p>
          </div>

          <div className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Mã biên nhận hồ sơ:</strong> #{trackingDetail.trackingCode}</p>
              <p><strong>Ngày tiếp nhận:</strong> {new Date(trackingDetail.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Người phản ánh:</strong> {trackingDetail.citizenNameMasked}</p>
              <p><strong>Số điện thoại:</strong> {trackingDetail.citizenPhoneMasked || '(Ẩn danh)'}</p>
            </div>
            <p><strong>Chuyên mục nghiệp vụ:</strong> {trackingDetail.categoryName}</p>
            <p><strong>Cơ quan thụ lý giải quyết:</strong> {trackingDetail.departmentName}</p>
            <p><strong>Địa bàn / Vị trí:</strong> {trackingDetail.addressText}</p>
            <p><strong>Tiêu đề phản ánh:</strong> {trackingDetail.title}</p>
            <p><strong>Nội dung tóm tắt:</strong> {trackingDetail.content}</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <p><strong>Hạn chót giải quyết (SLA):</strong> {trackingDetail.dueDate ? new Date(trackingDetail.dueDate).toLocaleString('vi-VN') : 'Theo quy định'}</p>
              <p><strong>Tình trạng hiện tại:</strong> {trackingDetail.statusName}</p>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="font-bold">NGƯỜI NỘP PHẢN ÁNH</p>
              <p className="italic text-[10px] mt-1">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold">BỘ PHẬN TIẾP NHẬN & PHÂN LOẠI</p>
              <p className="italic text-[10px] mt-1">(Đã ký số điện tử trên hệ thống)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
