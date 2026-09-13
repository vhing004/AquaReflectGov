import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { masterDataApi } from '../api/masterDataApi';
import { petitionApi } from '../api/petitionApi';
import type { Category, AdministrativeUnit, CreatePetitionResult } from '../types';
import { 
  Send, 
  MapPin, 
  Camera, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Anchor, 
  Droplets, 
  LifeBuoy, 
  Layers, 
  ChevronRight,
  Upload,
  X,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Loader2,
  FileIcon,
  ShieldCheck,
  Compass,
  Building2,
  Phone,
  User,
  Mail
} from 'lucide-react';

export const SubmitPetitionPage: React.FC = () => {
  const { user } = useAuthStore();

  // Master Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // Form input state
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [administrativeUnitId, setAdministrativeUnitId] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('Khu vực Cửa biển Sa Kỳ, Xã Bình Châu, Huyện Bình Sơn, Tỉnh Quảng Ngãi');
  const [gpsCoordinates, setGpsCoordinates] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Citizen info state (for guests or pre-filled from user)
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenAddress, setCitizenAddress] = useState('');

  // Files state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ name: string; url?: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPetition, setSubmittedPetition] = useState<CreatePetitionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking query on the right side
  const [trackingCodeInput, setTrackingCodeInput] = useState('#TS-2024-8891');
  const [activeTrackingCode, setActiveTrackingCode] = useState('#TS-2024-8891');

  // Load master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoadingMasterData(true);
        const [catRes, provRes] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getAdministrativeUnits(undefined, 1),
        ]);

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          // Default select first category (e.g. IUU or Pollution)
          const defaultCat = catRes.data.find(c => c.code === 'VI_PHAM_IUU') || catRes.data[0];
          setCategoryId(defaultCat.id);
        }

        if (provRes.data && provRes.data.length > 0) {
          setProvinces(provRes.data);
          // Default select Quang Ngai if found or first
          const qng = provRes.data.find(p => p.code === 'QNG') || provRes.data[0];
          if (qng) {
            setAdministrativeUnitId(qng.id);
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh mục hoặc đơn vị hành chính:', err);
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  // Update citizen details when user state changes
  useEffect(() => {
    if (user) {
      setCitizenName(user.fullName || '');
      setCitizenPhone(user.phoneNumber || '');
      setCitizenEmail(user.email || '');
    }
  }, [user]);

  // Handle GPS location detection
  const handleGetGps = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGettingGps(false);
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          const coordsStr = `${lat}°N, ${lng}°E`;
          setGpsCoordinates(coordsStr);
          setLocation((prev) => 
            prev.includes('Tọa độ GPS:') ? prev : `${prev} [GPS: ${coordsStr}]`
          );
        },
        () => {
          setIsGettingGps(false);
          const fallbackCoords = "15°13'45.2\"N, 108°52'10.5\"E";
          setGpsCoordinates(fallbackCoords);
          setLocation((prev) => 
            prev.includes('GPS:') ? prev : `${prev} [GPS: ${fallbackCoords}]`
          );
        },
        { timeout: 6000 }
      );
    } else {
      setIsGettingGps(false);
      const fallbackCoords = "15°13'45.2\"N, 108°52'10.5\"E";
      setGpsCoordinates(fallbackCoords);
      setLocation((prev) => `${prev} [GPS: ${fallbackCoords}]`);
    }
  };

  // Handle file selections
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (selectedFiles.length + newFiles.length > 5) {
      setSubmitError('Hệ thống chỉ cho phép tải lên tối đa 5 tệp đính kèm.');
      return;
    }

    // Check size limit: 25MB each
    const oversized = newFiles.some((f) => f.size > 25 * 1024 * 1024);
    if (oversized) {
      setSubmitError('Tệp đính kèm không được vượt quá 25MB mỗi tệp.');
      return;
    }

    setSubmitError(null);
    const updated = [...selectedFiles, ...newFiles];
    setSelectedFiles(updated);

    // Create preview objects
    const previews = updated.map((f) => {
      const isImg = f.type.startsWith('image/');
      return {
        name: f.name,
        url: isImg ? URL.createObjectURL(f) : undefined,
        type: f.type,
      };
    });
    setFilePreviews(previews);
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(updatedPreviews);
  };

  const copyTrackingCode = () => {
    if (!submittedPetition) return;
    navigator.clipboard.writeText(submittedPetition.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Helper for category icons
  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'VI_PHAM_IUU':
        return <Anchor className="w-4 h-4 text-[#006194]" />;
      case 'O_NHIEM_NUOC':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'DICH_BENH':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'HA_TANG_CANG_CA':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'GIONG_THUC_AN':
        return <LifeBuoy className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-600" />;
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!categoryId) {
      setSubmitError('Vui lòng chọn chuyên mục phản ánh.');
      return;
    }
    if (title.trim().length < 5) {
      setSubmitError('Tiêu đề phản ánh phải có ít nhất 5 ký tự.');
      return;
    }
    if (description.trim().length < 10) {
      setSubmitError('Nội dung phản ánh phải có ít nhất 10 ký tự để bộ phận nghiệp vụ xác minh.');
      return;
    }
    if (!user && (!citizenName.trim() || !citizenPhone.trim())) {
      setSubmitError('Vui lòng cung cấp Họ tên và Số điện thoại liên hệ để nhận thông báo giải quyết.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('CategoryId', categoryId);
      formData.append('Title', title.trim());
      formData.append('Content', description.trim());
      formData.append('Description', description.trim());
      formData.append('AddressText', location.trim());
      formData.append('Location', location.trim());

      if (gpsCoordinates) {
        formData.append('GpsCoordinates', gpsCoordinates);
      }
      if (administrativeUnitId) {
        formData.append('AdministrativeUnitId', administrativeUnitId.toString());
      }

      formData.append('CitizenName', citizenName.trim() || (user?.fullName ?? ''));
      formData.append('CitizenPhone', citizenPhone.trim() || (user?.phoneNumber ?? ''));
      if (citizenEmail.trim() || user?.email) {
        formData.append('CitizenEmail', citizenEmail.trim() || (user?.email ?? ''));
      }
      if (citizenAddress.trim()) {
        formData.append('CitizenAddress', citizenAddress.trim());
      }

      formData.append('IsAnonymous', String(isAnonymous));

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('Files', file);
      });

      const response = await petitionApi.createPetition(formData);

      if (response.success && response.data) {
        setSubmittedPetition(response.data);
        setActiveTrackingCode(response.data.trackingCode);
        setTrackingCodeInput(response.data.trackingCode);

        // Reset form inputs for next petition
        setTitle('');
        setDescription('');
        setSelectedFiles([]);
        setFilePreviews([]);
      } else {
        setSubmitError(response.message || 'Không thể gửi phản ánh. Vui lòng kiểm tra lại.');
      }
    } catch (err: any) {
      console.error('Lỗi khi nộp phản ánh:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Có lỗi xảy ra trong quá trình nộp hồ sơ. Vui lòng thử lại sau.';
      setSubmitError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. BREADCRUMB & BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 font-medium">
          <span className="text-[#006194] font-bold">Cục Thủy Sản</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Phản ánh & Kiến nghị số</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">Biểu mẫu số 04B / CVC-BCH</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống tiếp nhận trực tuyến 28 tỉnh ven biển 24/7</span>
        </div>
      </div>

      {/* 2. MAIN DUAL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* === CỘT TRÁI (COL-SPAN-7): BIỂU MẪU NỘP PHẢN ÁNH === */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
                Biểu mẫu số 04B / CVC-BCH
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Tiếp Nhận Phản Ánh, Kiến Nghị Thủy Sản
              </h2>
            </div>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-sky-50 text-[#006194] px-2.5 py-1 rounded-full border border-sky-100">
              <Lock className="w-3 h-3" />
              <span>Bảo mật SSL 256-bit</span>
            </span>
          </div>

          {/* BANNER THÀNH CÔNG KHI NỘP XONG */}
          {submittedPetition && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 text-xs space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-900">
                      Gửi phản ánh thành công!
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      Hồ sơ đã được mã hóa và chuyển giao đến Chi cục Thủy sản phụ trách.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedPetition(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thông tin biên nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-800">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mã biên nhận hồ sơ</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-black text-sm text-[#006194]">
                      {submittedPetition.trackingCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyTrackingCode}
                      className="text-slate-500 hover:text-[#006194] p-1 rounded transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời hạn xử lý (SLA)</span>
                  <div className="flex items-center space-x-1.5 mt-1 font-bold text-xs text-rose-700">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>{submittedPetition.defaultSlaHours} Giờ làm việc</span>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạn chót giải quyết</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {new Date(submittedPetition.dueDate).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {submittedPetition.attachments && submittedPetition.attachments.length > 0 && (
                <div className="text-[11px] text-slate-600 pt-1">
                  <span className="font-semibold">Tệp đính kèm đã lưu: </span>
                  {submittedPetition.attachments.map((att) => att.fileName).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Chuyên mục phản ánh (Dynamic categories từ API) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Chuyên mục phản ánh <span className="text-rose-500">*</span>
                </label>
                <span className="text-slate-400">
                  {selectedCategory ? `Thời hạn quy định SLA: ${selectedCategory.defaultSlaHours}h` : 'Phân loại đúng để xử lý nhanh'}
                </span>
              </div>

              {isLoadingMasterData ? (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#006194]" />
                  <span>Đang tải danh mục nghiệp vụ...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <label
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'border-[#006194] bg-sky-50/60 ring-1 ring-[#006194]'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={isSelected}
                          onChange={() => setCategoryId(cat.id)}
                          className="mt-1 accent-[#006194]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 truncate">
                              {getCategoryIcon(cat.code)}
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              cat.defaultSlaHours <= 24 
                                ? 'bg-rose-100 text-rose-700' 
                                : cat.defaultSlaHours <= 48 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              SLA {cat.defaultSlaHours}h
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {cat.description || 'Tiếp nhận phản ánh thuộc lĩnh vực này.'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Tiêu đề */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Tiêu đề phản ánh / Yêu cầu giải quyết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Tàu giã cào sai tuyến tại vùng nước ven bờ Sa Kỳ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* 3. Địa bàn & Tọa độ Hải trình GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tỉnh / TP ven biển phụ trách</span>
                </label>
                <select
                  value={administrativeUnitId || ''}
                  onChange={(e) => setAdministrativeUnitId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-7 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tọa độ thực địa / GPS VMS</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={isGettingGps}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#006194] bg-sky-50 hover:bg-sky-100 px-2.5 py-0.5 rounded-lg transition-colors border border-sky-200"
                  >
                    <MapPin className="w-3 h-3 text-[#006194]" />
                    <span>{isGettingGps ? 'Đang đọc...' : 'Lấy GPS thiết bị'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={gpsCoordinates}
                  onChange={(e) => setGpsCoordinates(e.target.value)}
                  placeholder="Ví dụ: 15°13'45.2&quot;N, 108°52'10.5&quot;E"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Chi tiết địa điểm */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Địa điểm xảy ra sự việc & Chi tiết vùng biển <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 4. Nội dung chi tiết */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Nội dung chi tiết kiến nghị <span className="text-rose-500">*</span>
                </label>
                <span className="text-slate-400">Tối đa 2.000 ký tự ({description.length}/2000)</span>
              </div>
              <textarea
                rows={4}
                required
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể thời gian, vị trí, diễn biến sự việc, mức độ ảnh hưởng đến hoạt động thủy sản và đề xuất biện pháp xử lý..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            {/* 5. Khối Upload tệp đính kèm thực tế */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-[#006194]" />
                  <span>Minh chứng hiện trường (Ảnh, Video thực địa, Nhật ký biển, PDF)</span>
                </label>
                <span className="text-slate-400">Tối đa 5 tệp, không quá 25MB/tệp</span>
              </div>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.mp4,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#006194] rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-sky-50/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 text-[#006194] group-hover:scale-110 flex items-center justify-center mx-auto mb-2 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Nhấn để chọn tệp hoặc chụp ảnh thực địa từ thiết bị
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hỗ trợ định dạng: JPG, PNG, MP4, PDF, DOCX
                </p>
              </div>

              {/* Danh sách tệp đã chọn */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {selectedFiles.map((file, idx) => {
                    const preview = filePreviews[idx];
                    const isImg = file.type.startsWith('image/');
                    const sizeStr = file.size > 1024 * 1024 
                      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                      : `${(file.size / 1024).toFixed(0)} KB`;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          {isImg && preview?.url ? (
                            <img
                              src={preview.url}
                              alt={file.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#006194] flex items-center justify-center shrink-0">
                              <FileIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[170px]">
                              {file.name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">{sizeStr}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Thông tin người gửi (Công dân hoặc Đã đăng nhập) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Thông tin người phản ánh kiến nghị</span>
                </span>
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded accent-[#006194]"
                  />
                  <span className="text-slate-600 font-medium">Ẩn danh tính khi công khai</span>
                </label>
              </div>

              {user ? (
                <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div className="w-10 h-10 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      Vai trò: <span className="font-semibold text-[#006194]">{user.roleName || user.role}</span> • Email: {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Họ và tên người gửi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn Hải"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006194] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Số điện thoại nhận thông báo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006194] bg-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Email liên hệ (tùy chọn - nhận mã tra cứu & quyết định)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="nguyenvanhai@thuy-san.vn"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006194] bg-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Địa chỉ liên hệ thường trú / Tạm trú (tùy chọn)
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={citizenAddress}
                        onChange={(e) => setCitizenAddress(e.target.value)}
                        placeholder="Ví dụ: Thôn Định Tân, Xã Bình Châu, Huyện Bình Sơn, Tỉnh Quảng Ngãi"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006194] bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nút gửi đơn */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-[#006194] hover:bg-[#0284c7] disabled:bg-slate-400 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải lên tệp & Lưu hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Nộp Hồ Sơ Phản Ánh Kiến Nghị</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => alert('Đã lưu nội dung tạm vào trình duyệt!')}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Lưu nháp
              </button>
            </div>
          </form>
        </section>

        {/* === CỘT PHẢI (COL-SPAN-5): KHUNG TRA CỨU TIẾN ĐỘ THỜI GIAN THỰC === */}
        <section className="lg:col-span-5 space-y-6">
          {/* Hộp tra cứu nhanh */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
              Tra cứu tiến độ giải quyết hồ sơ
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={trackingCodeInput}
                onChange={(e) => setTrackingCodeInput(e.target.value)}
                placeholder="Nhập mã TS-2026..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] uppercase bg-slate-50"
              />
              <button
                onClick={() => setActiveTrackingCode(trackingCodeInput)}
                className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold transition-colors"
              >
                Tra cứu
              </button>
            </div>
          </div>

          {/* Card hiển thị tiến độ chi tiết theo mẫu */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-sm text-[#006194]">{activeTrackingCode}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {submittedPetition && activeTrackingCode === submittedPetition.trackingCode 
                      ? 'Đang thụ lý' 
                      : 'Đã có kết quả'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tiếp nhận: {submittedPetition && activeTrackingCode === submittedPetition.trackingCode 
                    ? 'Hôm nay' 
                    : '14/10/2024'} • Kênh: Cổng DVC Thủy Sản Trực Tuyến
                </p>
              </div>
              <button
                onClick={() => window.print()}
                title="In phiếu tiếp nhận"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Tóm tắt nội dung */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Vấn đề phản ánh</span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                  ? submittedPetition.title
                  : 'Kiến nghị nạo vét luồng lạch tại Cửa biển Sa Kỳ đảm bảo an toàn tàu trên 700CV ra vào cập cảng'}
              </h4>
              <p className="text-[11px] text-slate-600">
                Đơn vị giải quyết: <strong className="text-[#006194]">
                  {submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                    ? 'Chi cục Thủy sản tỉnh Quảng Ngãi & BQL Cảng cá'
                    : 'Ban Quản lý Cảng cá & Chi cục Thủy sản Quảng Ngãi'}
                </strong>
              </p>
            </div>

            {/* Quy trình giải quyết 4 bước chuẩn */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quy trình giải quyết 4 bước
              </span>

              <div className="relative pl-6 space-y-5">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-emerald-400"></div>

                {/* Bước 1 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#006194] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">1. Đã tiếp nhận & Cấp mã sổ bộ</span>
                      <span className="text-[10px] text-slate-400">Tự động</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bộ phận điều phối thẩm định hồ sơ số và tính hợp lệ.
                    </p>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#006194] text-white'
                  }`}>
                    {submittedPetition && activeTrackingCode === submittedPetition.trackingCode ? '⋯' : '✓'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">2. Thẩm tra thực địa & Giám sát VMS</span>
                      <span className="text-[10px] text-slate-400">Đang triển khai</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Trích xuất dữ liệu hải trình, kiểm tra mẫu nước hoặc hiện trường.
                    </p>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                      ? 'bg-slate-300 text-slate-600'
                      : 'bg-[#006194] text-white'
                  }`}>
                    {submittedPetition && activeTrackingCode === submittedPetition.trackingCode ? '3' : '✓'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">3. Phối hợp xử lý liên ngành</span>
                      <span className="text-[10px] text-slate-400">Chờ kết luận</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phối hợp Đồn Biên phòng, Ban Quản lý cảng cá, Phòng Nông nghiệp.
                    </p>
                  </div>
                </div>

                {/* Bước 4 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                      ? 'bg-slate-300 text-slate-600'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {submittedPetition && activeTrackingCode === submittedPetition.trackingCode ? '4' : '✓'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${
                        submittedPetition && activeTrackingCode === submittedPetition.trackingCode
                          ? 'text-slate-700'
                          : 'text-emerald-800'
                      }`}>
                        4. Ban hành văn bản & Kết luận công khai
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kết quả giải quyết được thông báo qua SMS/Email và niêm yết công khai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tải về tài liệu */}
            <div className="pt-2 border-t border-slate-100">
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Tải về văn bản quyết định giải quyết có đóng dấu số của Cục Thủy Sản.');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors text-xs text-[#006194]"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#006194]" />
                  <span className="font-bold">Quyet_dinh_xu_ly_thuy_san.pdf</span>
                </div>
                <Printer className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
