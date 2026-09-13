import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { masterDataApi } from '../api/masterDataApi';
import { petitionApi } from '../api/petitionApi';
import { PetitionReceiptModal } from '../components/petition/PetitionReceiptModal';
import type { Category, AdministrativeUnit, CreatePetitionResult, PetitionTrackingDetail } from '../types';
import { 
  Send, 
  MapPin, 
  Camera, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Anchor, 
  Droplets, 
  LifeBuoy, 
  Layers, 
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Loader2,
  FileIcon,
  Compass,
  Building2,
  Phone,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  LayoutList,
  Save,
  QrCode,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_DRAFT_KEY = 'aquareflect_petition_draft';

// Quick location presets for major fishing ports & hot spots
interface LocationPreset {
  label: string;
  location: string;
  coords: string;
  provinceCode: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  {
    label: 'Cảng Sa Kỳ (Quảng Ngãi)',
    location: 'Khu neo đậu tránh trú bão & Cảng cá Sa Kỳ, Xã Bình Châu, Huyện Bình Sơn, Tỉnh Quảng Ngãi',
    coords: "15°13'45.2\"N, 108°52'10.5\"E",
    provinceCode: 'QNG',
  },
  {
    label: 'Cảng Thọ Quang (Đà Nẵng)',
    location: 'Âu thuyền & Cảng cá Thọ Quang, Phường Thọ Quang, Quận Sơn Trà, TP. Đà Nẵng',
    coords: "16°06'35.0\"N, 108°14'15.0\"E",
    provinceCode: 'DNG',
  },
  {
    label: 'Cảng Cửa Đại (Quảng Nam)',
    location: 'Cửa biển & Khu bảo tồn biển Cù Lao Chàm, Phường Cửa Đại, TP. Hội An, Tỉnh Quảng Nam',
    coords: "15°52'28.0\"N, 108°23'12.0\"E",
    provinceCode: 'QNM',
  },
  {
    label: 'Cảng cá Sông Đốc (Cà Mau)',
    location: 'Cửa biển Sông Đốc, Thị trấn Sông Đốc, Huyện Trần Văn Thời, Tỉnh Cà Mau',
    coords: "09°04'12.0\"N, 104°58'30.0\"E",
    provinceCode: 'CMU',
  },
  {
    label: 'Cảng An Thới (Phú Quốc)',
    location: 'Khu neo đậu tàu thuyền An Thới, Phường An Thới, TP. Phú Quốc, Tỉnh Kiên Giang',
    coords: "10°00'50.0\"N, 104°00'45.0\"E",
    provinceCode: 'KGG',
  },
  {
    label: 'Cảng Hòn Rớ (Nha Trang)',
    location: 'Cảng cá Hòn Rớ, Xã Phước Đồng, TP. Nha Trang, Tỉnh Khánh Hòa',
    coords: "12°12'18.0\"N, 109°11'42.0\"E",
    provinceCode: 'KHA',
  },
];

export const SubmitPetitionPage: React.FC = () => {
  const { user } = useAuthStore();

  // Wizard or Full Form mode
  const [formMode, setFormMode] = useState<'wizard' | 'all'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);

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

  // Draft state
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [draftToastMessage, setDraftToastMessage] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPetition, setSubmittedPetition] = useState<CreatePetitionResult | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking query on the right side
  const [trackingCodeInput, setTrackingCodeInput] = useState('TS-202609-HGZH4');
  const [activeTrackingCode, setActiveTrackingCode] = useState('TS-202609-HGZH4');
  const [trackedDetail, setTrackedDetail] = useState<PetitionTrackingDetail | null>(null);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  // Check draft on component mount
  useEffect(() => {
    try {
      const savedDraftRaw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (savedDraftRaw) {
        const parsed = JSON.parse(savedDraftRaw);
        if (parsed && (parsed.title || parsed.description || parsed.location)) {
          setHasSavedDraft(true);
          if (parsed.savedAt) {
            setDraftSavedTime(new Date(parsed.savedAt).toLocaleString('vi-VN'));
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Auto fetch real tracking details when activeTrackingCode changes
  useEffect(() => {
    const code = activeTrackingCode.replace('#', '').trim();
    if (code) {
      setIsTrackLoading(true);
      petitionApi.trackPetition(code)
        .then((res) => {
          if (res.success && res.data) {
            setTrackedDetail(res.data);
          }
        })
        .catch(() => {
          setTrackedDetail(null);
        })
        .finally(() => {
          setIsTrackLoading(false);
        });
    }
  }, [activeTrackingCode]);

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
          const defaultCat = catRes.data.find(c => c.code === 'VI_PHAM_IUU') || catRes.data[0];
          setCategoryId(defaultCat.id);
        }

        if (provRes.data && provRes.data.length > 0) {
          setProvinces(provRes.data);
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
            prev.includes('GPS:') ? prev : `${prev} [GPS: ${coordsStr}]`
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

  // Select Quick Preset
  const handleSelectPreset = (preset: LocationPreset) => {
    setLocation(preset.location);
    setGpsCoordinates(preset.coords);
    const matchedProv = provinces.find((p) => p.code === preset.provinceCode);
    if (matchedProv) {
      setAdministrativeUnitId(matchedProv.id);
    }
  };

  // Draft helpers
  const handleSaveDraft = () => {
    try {
      const draftData = {
        categoryId,
        title,
        administrativeUnitId,
        location,
        gpsCoordinates,
        description,
        isAnonymous,
        citizenName,
        citizenPhone,
        citizenEmail,
        citizenAddress,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftData));
      setHasSavedDraft(true);
      setDraftSavedTime(new Date().toLocaleString('vi-VN'));
      setDraftToastMessage('Đã lưu bản nháp vào thiết bị an toàn!');
      setTimeout(() => setDraftToastMessage(null), 3000);
    } catch {
      setDraftToastMessage('Không thể lưu bản nháp do bộ nhớ trình duyệt bị giới hạn.');
      setTimeout(() => setDraftToastMessage(null), 3000);
    }
  };

  const handleRestoreDraft = () => {
    try {
      const savedDraftRaw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (!savedDraftRaw) return;
      const d = JSON.parse(savedDraftRaw);
      if (d.categoryId) setCategoryId(d.categoryId);
      if (d.title) setTitle(d.title);
      if (d.administrativeUnitId) setAdministrativeUnitId(d.administrativeUnitId);
      if (d.location) setLocation(d.location);
      if (d.gpsCoordinates) setGpsCoordinates(d.gpsCoordinates);
      if (d.description) setDescription(d.description);
      if (typeof d.isAnonymous === 'boolean') setIsAnonymous(d.isAnonymous);
      if (d.citizenName && !user) setCitizenName(d.citizenName);
      if (d.citizenPhone && !user) setCitizenPhone(d.citizenPhone);
      if (d.citizenEmail && !user) setCitizenEmail(d.citizenEmail);
      if (d.citizenAddress) setCitizenAddress(d.citizenAddress);

      setDraftToastMessage('Đã khôi phục thành công bản nháp trước đó!');
      setHasSavedDraft(false);
      setTimeout(() => setDraftToastMessage(null), 3000);
    } catch {
      setDraftToastMessage('Lỗi khôi phục bản nháp.');
      setTimeout(() => setDraftToastMessage(null), 3000);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    setHasSavedDraft(false);
    setDraftSavedTime(null);
  };

  // Handle file selections
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    if (selectedFiles.length + newFiles.length > 5) {
      setSubmitError('Hệ thống chỉ cho phép tải lên tối đa 5 tệp đính kèm.');
      return;
    }

    const oversized = newFiles.some((f) => f.size > 25 * 1024 * 1024);
    if (oversized) {
      setSubmitError('Tệp đính kèm không được vượt quá 25MB mỗi tệp.');
      return;
    }

    setSubmitError(null);
    const updated = [...selectedFiles, ...newFiles];
    setSelectedFiles(updated);

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

  // Category Icon helper
  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'VI_PHAM_IUU':
        return <Anchor className="w-5 h-5 text-[#006194]" />;
      case 'O_NHIEM_NUOC':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'DICH_BENH':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'HA_TANG_CANG_CA':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'GIONG_THUC_AN':
        return <LifeBuoy className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600" />;
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedProvince = provinces.find((p) => p.id === administrativeUnitId);

  // Wizard Step Validation
  const validateStep = (step: number): boolean => {
    setSubmitError(null);
    if (step === 1) {
      if (!categoryId) {
        setSubmitError('Vui lòng chọn một chuyên mục phản ánh phù hợp.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (title.trim().length < 5) {
        setSubmitError('Tiêu đề phản ánh phải có ít nhất 5 ký tự.');
        return false;
      }
      if (!location.trim() || location.trim().length < 5) {
        setSubmitError('Vui lòng nhập rõ vị trí xảy ra sự việc hoặc cảng cá / vùng biển liên quan.');
        return false;
      }
      if (description.trim().length < 10) {
        setSubmitError('Nội dung phản ánh phải có ít nhất 10 ký tự để bộ phận thẩm tra xử lý.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      // Step 3 (Attachments) is optional, but valid
      return true;
    }
    if (step === 4) {
      if (!user && !isAnonymous && (!citizenName.trim() || !citizenPhone.trim())) {
        setSubmitError('Vui lòng cung cấp Họ tên và Số điện thoại liên hệ (hoặc chọn Ẩn danh).');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
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
        setShowReceiptModal(true); // Open modal with QR Code

        // Clear local storage draft
        localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        setHasSavedDraft(false);

        // Reset form inputs for next petition
        setTitle('');
        setDescription('');
        setSelectedFiles([]);
        setFilePreviews([]);
        setCurrentStep(1);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. BREADCRUMB & STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 font-medium">
          <Link to="/" className="text-[#006194] font-bold hover:underline">Cổng DVC Thủy Sản</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Gửi phản ánh kiến nghị</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">Biểu mẫu số 04B / CVC-BCH</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tiếp nhận trực tuyến 28 tỉnh ven biển 24/7</span>
        </div>
      </div>

      {/* DRAFT RESTORE BANNER */}
      {hasSavedDraft && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <Save className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Phát hiện bản nháp chưa gửi</span>
              {draftSavedTime && <span className="text-amber-700 ml-1">({draftSavedTime})</span>}
              <p className="text-[11px] text-amber-700">Dữ liệu được lưu trong trình duyệt phòng trường hợp mất sóng biển.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-xs"
            >
              Khôi phục dữ liệu
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100 font-medium transition-colors"
            >
              Xóa bản nháp
            </button>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE BANNER */}
      {draftToastMessage && (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[#006194] text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#006194]" />
          <span>{draftToastMessage}</span>
        </div>
      )}

      {/* 2. MAIN DUAL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* === CỘT TRÁI (COL-SPAN-7): BIỂU MẪU NỘP PHẢN ÁNH === */}
        <section className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* HEADER FORM & VIEW MODE SWITCH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194] flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Biểu mẫu số 04B / CVC-BCH</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Tiếp Nhận Phản Ánh, Kiến Nghị
              </h2>
            </div>

            {/* SWITCH CHẾ ĐỘ WIZARD / FULL FORM */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFormMode('wizard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  formMode === 'wizard'
                    ? 'bg-white text-[#006194] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>4 Bước (Mobile)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormMode('all')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  formMode === 'all'
                    ? 'bg-white text-[#006194] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Xem đầy đủ</span>
              </button>
            </div>
          </div>

          {/* THANH CHỈ BÁO BƯỚC (STEP INDICATOR) - KHI Ở CHẾ ĐỘ WIZARD */}
          {formMode === 'wizard' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-extrabold text-[#006194]">
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#006194] text-[11px]">
                    Bước {currentStep}/4
                  </span>
                  <span className="text-slate-800">
                    {currentStep === 1 && '1. Lĩnh vực phản ánh & SLA'}
                    {currentStep === 2 && '2. Địa bàn, Tọa độ & Nội dung'}
                    {currentStep === 3 && '3. Minh chứng ảnh / Video thực địa'}
                    {currentStep === 4 && '4. Thông tin người gửi & Xác nhận'}
                  </span>
                </div>
                <span className="text-slate-400 font-bold text-[11px]">
                  {currentStep * 25}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#006194] to-cyan-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${currentStep * 25}%` }}
                ></div>
              </div>

              {/* Step pills clickable */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { num: 1, label: 'Lĩnh vực' },
                  { num: 2, label: 'Nội dung' },
                  { num: 3, label: 'Tệp đính kèm' },
                  { num: 4, label: 'Xác nhận' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep || validateStep(currentStep)) {
                        setCurrentStep(s.num);
                      }
                    }}
                    className={`py-1 text-center rounded-lg text-[10px] font-bold transition-all ${
                      s.num === currentStep
                        ? 'bg-sky-50 text-[#006194] border border-sky-200'
                        : s.num < currentStep
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-400 bg-transparent'
                    }`}
                  >
                    {s.num < currentStep ? '✓ ' : ''}{s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                      Hồ sơ đã được mã hóa và tiếp nhận vào hệ thống nghiệp vụ Cục Thủy Sản.
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

              {/* Thông tin biên nhận nhanh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-slate-800">
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60">
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

                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời hạn xử lý (SLA)</span>
                  <div className="flex items-center space-x-1.5 mt-1 font-bold text-xs text-rose-700">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>{submittedPetition.defaultSlaHours} Giờ làm việc</span>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/60">
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

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Xem & Tải Mã QR Biên Nhận</span>
                </button>
                <Link
                  to={`/track?code=${encodeURIComponent(submittedPetition.trackingCode)}`}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#006194] font-bold text-xs transition-all flex items-center space-x-1.5"
                >
                  <span>Theo dõi tiến độ trực tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ======================================================== */}
            {/* BƯỚC 1: CHUYÊN MỤC PHẢN ÁNH & CAM KẾT SLA              */}
            {/* ======================================================== */}
            {(formMode === 'all' || currentStep === 1) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006194] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Chọn chuyên mục phản ánh kiến nghị <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-slate-500 text-[11px]">
                    {selectedCategory ? `Cam kết SLA: ${selectedCategory.defaultSlaHours}h` : 'Phân loại đúng để xử lý nhanh'}
                  </span>
                </div>

                {isLoadingMasterData ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center space-x-2 bg-slate-50 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin text-[#006194]" />
                    <span>Đang tải danh mục lĩnh vực nghiệp vụ...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => {
                      const isSelected = categoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategoryId(cat.id)}
                          className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start space-x-3 select-none active:scale-[0.99] ${
                            isSelected
                              ? 'border-[#006194] bg-sky-50/70 ring-2 ring-[#006194]/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={isSelected}
                            onChange={() => setCategoryId(cat.id)}
                            className="mt-1 accent-[#006194] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 truncate">
                                {getCategoryIcon(cat.code)}
                                <span className="truncate">{cat.name}</span>
                              </div>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* BƯỚC 2: ĐỊA BÀN, TỌA ĐỘ VÀ NỘI DUNG SỰ VIỆC             */}
            {/* ======================================================== */}
            {(formMode === 'all' || currentStep === 2) && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <label className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006194] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Địa bàn, Tọa độ & Nội dung sự việc</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Thông tin thực địa</span>
                </div>

                {/* Tiêu đề */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Tiêu đề phản ánh kiến nghị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Tàu giã cào khai thác sai luồng tuyến tại Cửa biển Sa Kỳ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                {/* Địa bàn tỉnh & GPS */}
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
                      <option value="">-- Chọn Tỉnh / TP ven biển --</option>
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
                        <span>{isGettingGps ? 'Đang đọc...' : 'GPS tự động 1 chạm'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      placeholder="Ví dụ: 15°13'45.2&quot;N, 108°52'10.5&quot;E"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* QUICK LOCATION PRESETS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Gợi ý chọn nhanh tọa độ các cảng cá / ngư trường trọng điểm:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATION_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="text-[11px] font-medium bg-slate-100 hover:bg-sky-50 hover:text-[#006194] text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chi tiết địa điểm */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Vị trí chi tiết vùng biển / Cảng cá / Vùng nuôi trồng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Nội dung chi tiết */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800">
                      Nội dung chi tiết phản ánh kiến nghị <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-slate-400">Tối đa 2.000 ký tự ({description.length}/2000)</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả cụ thể thời gian xảy ra, phương tiện liên quan (số hiệu tàu nếu có), diễn biến sự việc, mức độ ảnh hưởng đến sinh hoạt, nuôi trồng và đề xuất biện pháp xử lý..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-2xs resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* BƯỚC 3: MINH CHỨNG HIỆN TRƯỜNG (ẢNH / VIDEO / TỆP)      */}
            {/* ======================================================== */}
            {(formMode === 'all' || currentStep === 3) && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <label className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006194] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>Minh chứng hiện trường (Ảnh, Video, Tài liệu)</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">Tối đa 5 tệp (≤ 25MB/tệp)</span>
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
                  className="border-2 border-dashed border-slate-300 hover:border-[#006194] rounded-2xl p-6 text-center bg-slate-50/70 hover:bg-sky-50/40 transition-all cursor-pointer group select-none"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-[#006194] group-hover:scale-110 flex items-center justify-center mx-auto mb-2.5 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Chạm để chụp ảnh / quay video từ điện thoại hoặc chọn tệp từ máy
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Định dạng hỗ trợ: JPG, PNG, MP4, PDF, DOCX (Hệ thống tự động trích xuất tọa độ EXIF nếu có)
                  </p>
                </div>

                {/* Danh sách tệp đã chọn */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {selectedFiles.map((file, idx) => {
                      const preview = filePreviews[idx];
                      const isImg = file.type.startsWith('image/');
                      const sizeStr = file.size > 1024 * 1024 
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                        : `${(file.size / 1024).toFixed(0)} KB`;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {isImg && preview?.url ? (
                              <img
                                src={preview.url}
                                alt={file.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#006194] flex items-center justify-center shrink-0">
                                <FileIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                                {file.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">{sizeStr}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                            title="Xóa tệp"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* BƯỚC 4: THÔNG TIN NGƯỜI GỬI & XÁC NHẬN NỘP HỒ SƠ       */}
            {/* ======================================================== */}
            {(formMode === 'all' || currentStep === 4) && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <label className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006194] text-white text-[11px] flex items-center justify-center font-bold">4</span>
                    <span>Thông tin người gửi & Xem lại hồ sơ</span>
                  </label>
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded accent-[#006194]"
                    />
                    <span className="text-slate-600 font-medium text-xs">Ẩn danh tính khi công khai</span>
                  </label>
                </div>

                {user ? (
                  <div className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                    <div className="w-10 h-10 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {user.fullName ? user.fullName.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        Vai trò: <span className="font-semibold text-[#006194]">{user.roleName || user.role}</span> • Email: {user.email} • SĐT: {user.phoneNumber || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Họ và tên người gửi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required={!isAnonymous}
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
                          required={!isAnonymous}
                          value={citizenPhone}
                          onChange={(e) => setCitizenPhone(e.target.value)}
                          placeholder="0912 345 678"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006194] bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Email liên hệ (tùy chọn - nhận mã tra cứu & kết quả giải quyết)
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
                        Địa chỉ thường trú / Nơi neo đậu phương tiện (tùy chọn)
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

                {/* REVIEW SUMMARY TRƯỚC KHI NỘP */}
                {formMode === 'wizard' && currentStep === 4 && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#006194] flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Kiểm tra lại toàn bộ hồ sơ trước khi nộp</span>
                    </span>
                    <div className="space-y-1.5 text-slate-700">
                      <div>
                        <strong>Lĩnh vực:</strong> {selectedCategory?.name || 'Chưa chọn'} (SLA: {selectedCategory?.defaultSlaHours}h)
                      </div>
                      <div>
                        <strong>Tiêu đề:</strong> {title || '(Chưa nhập tiêu đề)'}
                      </div>
                      <div>
                        <strong>Địa bàn:</strong> {selectedProvince?.name || 'Chưa chọn'} • <strong>Vị trí:</strong> {location}
                      </div>
                      {gpsCoordinates && (
                        <div>
                          <strong>Tọa độ GPS:</strong> <span className="font-mono">{gpsCoordinates}</span>
                        </div>
                      )}
                      <div>
                        <strong>Minh chứng:</strong> {selectedFiles.length > 0 ? `${selectedFiles.length} tệp đính kèm` : 'Không có tệp đính kèm'}
                      </div>
                      <div>
                        <strong>Người gửi:</strong> {isAnonymous ? 'Chế độ ẩn danh tính' : (citizenName || user?.fullName || 'Chưa nhập')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ĐIỀU HƯỚNG WIZARD HOẶC NÚT GỬI TOÀN BỘ */}
            <div className="pt-2 border-t border-slate-100">
              {formMode === 'wizard' ? (
                <div className="flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu nháp</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-2">
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center space-x-1.5"
                      >
                        <span>Tiếp tục</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-2.5 px-6 rounded-xl bg-[#006194] hover:bg-[#0284c7] disabled:bg-slate-400 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang nộp hồ sơ...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Xác Nhận & Nộp Hồ Sơ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ XEM ĐẦY ĐỦ (ALL-IN-ONE) */
                <div className="flex flex-col sm:flex-row items-center gap-3">
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
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu nháp</span>
                  </button>
                </div>
              )}
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
                type="button"
                disabled={isTrackLoading}
                onClick={() => setActiveTrackingCode(trackingCodeInput)}
                className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] disabled:bg-slate-400 text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                {isTrackLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Tra cứu</span>
              </button>
            </div>
          </div>

          {/* Card hiển thị tiến độ chi tiết */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-sm text-[#006194]">
                    #{trackedDetail ? trackedDetail.trackingCode : (submittedPetition ? submittedPetition.trackingCode : activeTrackingCode)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    (trackedDetail?.status === 4 || submittedPetition?.status === 4)
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}>
                    {trackedDetail?.statusName || (submittedPetition ? submittedPetition.statusName : 'Mới tiếp nhận')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tiếp nhận: {trackedDetail ? new Date(trackedDetail.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'} • Cổng DVC Thủy Sản Trực Tuyến
                </p>
              </div>
              <button
                type="button"
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
                {trackedDetail?.title || submittedPetition?.title || 'Kiến nghị nạo vét luồng lạch tại Cửa biển Sa Kỳ đảm bảo an toàn tàu ra vào cập cảng'}
              </h4>
              <p className="text-[11px] text-slate-600">
                Đơn vị giải quyết: <strong className="text-[#006194]">
                  {trackedDetail?.departmentName || 'Chi cục Thủy sản tỉnh & BQL Cảng cá'}
                </strong>
              </p>
            </div>

            {/* Quy trình giải quyết 4 bước chuẩn */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quy trình giải quyết 4 bước
              </span>

              {(() => {
                const currentStatus = trackedDetail ? trackedDetail.status : (submittedPetition ? submittedPetition.status : 1);
                return (
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
                          <span className="text-[10px] text-slate-400">Đã xong</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hệ thống thẩm định hồ sơ số và phân loại nghiệp vụ.
                        </p>
                      </div>
                    </div>

                    {/* Bước 2 */}
                    <div className="relative flex items-start space-x-3 text-xs">
                      <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        currentStatus >= 2 ? 'bg-[#006194] text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {currentStatus >= 2 ? '✓' : '⋯'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">2. Thẩm tra thực địa & Giám sát VMS</span>
                          <span className="text-[10px] text-slate-400">
                            {currentStatus >= 2 ? 'Đã hoàn thành' : 'Đang xử lý'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Trích xuất dữ liệu hải trình, đo kiểm tra mẫu nước hoặc hiện trường.
                        </p>
                      </div>
                    </div>

                    {/* Bước 3 */}
                    <div className="relative flex items-start space-x-3 text-xs">
                      <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        currentStatus >= 3 ? 'bg-[#006194] text-white' : 'bg-slate-300 text-slate-600'
                      }`}>
                        {currentStatus >= 3 ? '✓' : '3'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">3. Phối hợp xử lý liên ngành</span>
                          <span className="text-[10px] text-slate-400">
                            {currentStatus >= 3 ? 'Đã hoàn thành' : 'Chờ phân công'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Phối hợp Đồn Biên phòng, Ban Quản lý cảng cá, Trạm Kiểm ngư.
                        </p>
                      </div>
                    </div>

                    {/* Bước 4 */}
                    <div className="relative flex items-start space-x-3 text-xs">
                      <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        currentStatus >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                      }`}>
                        {currentStatus >= 4 ? '✓' : '4'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${currentStatus >= 4 ? 'text-emerald-800' : 'text-slate-700'}`}>
                            4. Ban hành quyết định & Kết luận
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Ban hành văn bản giải quyết chính thức có đóng dấu số.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Link chuyển sang Cổng tra cứu chuyên sâu */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/track?code=${encodeURIComponent(
                  trackedDetail?.trackingCode || submittedPetition?.trackingCode || activeTrackingCode.replace('#', '')
                )}`}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#006194] hover:underline"
              >
                <span>Mở trang tra cứu chi tiết & nhật ký</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-slate-400">Theo dõi 24/7</span>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* MODAL BIÊN NHẬN ĐIỆN TỬ KÈM MÃ QR SAU KHI NỘP THÀNH CÔNG */}
      {/* ======================================================== */}
      {showReceiptModal && submittedPetition && (
        <PetitionReceiptModal
          petition={submittedPetition}
          onClose={() => setShowReceiptModal(false)}
          onNewPetition={() => {
            setShowReceiptModal(false);
            setSubmittedPetition(null);
            setCurrentStep(1);
          }}
        />
      )}
    </div>
  );
};
