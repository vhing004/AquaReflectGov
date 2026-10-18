import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { masterDataApi } from '../api/masterDataApi';
import { petitionApi } from '../api/petitionApi';
import { PetitionReceiptModal } from '../components/petition/PetitionReceiptModal';
import { AnonymousPinModal } from '../components/petition/AnonymousPinModal';
import { TurnstileWidget } from '../components/common/TurnstileWidget';
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
  Info,
  Waves
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MAJOR_FISHING_PORTS, SEA_ZONES, FISHING_GROUNDS, VIETNAM_COASTAL_PROVINCES } from '../data/maritimeData';

export type LocationType = 'LAND_COASTAL' | 'FISHING_PORT' | 'OFFSHORE_SEA';

const LOCAL_STORAGE_DRAFT_KEY = 'aquareflect_petition_draft';

// Dữ liệu danh mục chuẩn hóa nghiệp vụ ngành thủy sản (fallback an toàn)
const DEFAULT_PETITION_CATEGORIES: Category[] = [
  {
    id: 'VI_PHAM_IUU',
    name: 'Vi phạm khai thác hải sản IUU / Giã cào xung điện',
    code: 'VI_PHAM_IUU',
    categoryType: 3,
    categoryTypeName: 'IUUFishing',
    description: 'Phản ánh tàu cá giã cào hủy diệt ven bờ, sử dụng xung điện, xiếc máy, khai thác sai vùng biển hoặc vi phạm thiết bị giám sát VMS.',
    defaultSlaHours: 24,
    displayOrder: 1,
  },
  {
    id: 'O_NHIEM_NUOC',
    name: 'Ô nhiễm nguồn nước nuôi trồng / Xả thải độc hại',
    code: 'O_NHIEM_NUOC',
    categoryType: 1,
    categoryTypeName: 'WaterPollution',
    description: 'Phản ánh hiện tượng nước kênh rạch, vùng nuôi bị ô nhiễm màu đen/hôi, xả thải trộm từ nhà máy xí nghiệp.',
    defaultSlaHours: 48,
    displayOrder: 2,
  },
  {
    id: 'DICH_BENH',
    name: 'Dịch bệnh trên thủy hải sản (Tôm, cá chết hàng loạt)',
    code: 'DICH_BENH',
    categoryType: 2,
    categoryTypeName: 'AquaticDisease',
    description: 'Phản ánh tôm cá nuôi đột ngột chết hàng loạt, có dấu hiệu lây lan diện rộng (đốm trắng, hoại tử gan tụy). Cần xử lý khẩn.',
    defaultSlaHours: 24,
    displayOrder: 3,
  },
  {
    id: 'GIONG_THUC_AN',
    name: 'Chất lượng con giống & Thức ăn thủy sản kém chất lượng',
    code: 'GIONG_THUC_AN',
    categoryType: 4,
    categoryTypeName: 'SeedAndFeedQuality',
    description: 'Phản ánh cơ sở kinh doanh giống tôm cá trôi nổi, thuốc thú y thủy sản giả hoặc thức ăn chăn nuôi không rõ nguồn gốc.',
    defaultSlaHours: 72,
    displayOrder: 4,
  },
  {
    id: 'HA_TANG_CANG_CA',
    name: 'Hạ tầng cảng cá, luồng lạch bồi lắng, khu neo đậu',
    code: 'HA_TANG_CANG_CA',
    categoryType: 5,
    categoryTypeName: 'FisheryInfrastructure',
    description: 'Phản ánh cửa biển bị bồi lắng cản trở tàu bè ra vào, hư hỏng cầu cảng hoặc thiếu dịch vụ bến bãi neo đậu tránh bão.',
    defaultSlaHours: 120,
    displayOrder: 5,
  },
  {
    id: 'THU_TUC_HANH_CHINH',
    name: 'Cơ chế chính sách, TTHC đăng kiểm & cấp phép',
    code: 'THU_TUC_HANH_CHINH',
    categoryType: 6,
    categoryTypeName: 'AdministrativeProcedure',
    description: 'Kiến nghị về thủ tục đăng ký, đăng kiểm tàu cá, cấp phép nuôi trồng biển, hỗ trợ thiên tai dịch bệnh.',
    defaultSlaHours: 72,
    displayOrder: 6,
  },
  {
    id: 'KHAC',
    name: 'Vấn đề thủy sản khác',
    code: 'KHAC',
    categoryType: 7,
    categoryTypeName: 'Other',
    description: 'Các kiến nghị và phản ánh khác liên quan đến đời sống và hoạt động sản xuất thủy sản.',
    defaultSlaHours: 72,
    displayOrder: 7,
  },
];

// Danh sách trọn bộ 28 Tỉnh / Thành phố Ven biển Việt Nam
const DEFAULT_COASTAL_PROVINCES: AdministrativeUnit[] = VIETNAM_COASTAL_PROVINCES.map((p) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  level: 1,
}));

export const SubmitPetitionPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || searchParams.get('categoryCode') || searchParams.get('categoryId');

  // Wizard or Full Form mode
  const [formMode, setFormMode] = useState<'wizard' | 'all'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Master Data state - khởi tạo sẵn fallback 28 tỉnh ven biển để luôn có danh mục tức thì
  const [categories, setCategories] = useState<Category[]>(DEFAULT_PETITION_CATEGORIES);
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>(DEFAULT_COASTAL_PROVINCES);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  // Form input state
  const [categoryId, setCategoryId] = useState<string>('VI_PHAM_IUU');
  const [title, setTitle] = useState('');
  const [administrativeUnitId, setAdministrativeUnitId] = useState<number | undefined>(14); // Mặc định Quảng Ngãi
  const [location, setLocation] = useState('Khu vực Cửa biển Sa Kỳ, Xã Bình Châu, Huyện Bình Sơn, Tỉnh Quảng Ngãi');
  const [gpsCoordinates, setGpsCoordinates] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Cảnh báo khi tọa độ nằm ngoài vùng thủy hải sản (nội địa / không chăn nuôi thủy sản)
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  // Smart Location Selector State
  const [locationType, setLocationType] = useState<LocationType>('LAND_COASTAL');

  // State cho Đất liền / Ven bờ
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  // State cho Cảng cá
  const [selectedPortId, setSelectedPortId] = useState<string>('PORT_SA_KY');
  const [customPortName, setCustomPortName] = useState('');
  const [portPosition, setPortPosition] = useState('');

  // State cho Trên biển / Ngư trường
  const [seaZoneId, setSeaZoneId] = useState<string>('ZONE_CENTRAL');
  const [fishingGroundId, setFishingGroundId] = useState<string>('FG_HOANG_SA');
  const [distanceNauticalMiles, setDistanceNauticalMiles] = useState<string>('');
  const [oceanDirection, setOceanDirection] = useState<string>('Đông');

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSizeInfo, setUploadSizeInfo] = useState<{ loaded: string; total: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPetition, setSubmittedPetition] = useState<CreatePetitionResult | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');

  // State cho Modal PIN vô danh — hiển thị trước ReceiptModal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ trackingCode: string; accessPin: string } | null>(null);

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
        }

        if (provRes.data && provRes.data.length > 0) {
          // Merge thông minh: Cập nhật ID từ DB nhưng vẫn bảo tồn đủ 28 tỉnh ven biển
          const dbProvinces = provRes.data;
          const merged = VIETNAM_COASTAL_PROVINCES.map((cp) => {
            const matchedDb = dbProvinces.find(
              (dp) =>
                dp.code.toUpperCase() === cp.code.toUpperCase() ||
                dp.name.toLowerCase().includes(cp.name.toLowerCase().replace(/^(tỉnh|thành phố)\s*/i, ''))
            );
            return {
              id: matchedDb ? matchedDb.id : cp.id,
              code: cp.code,
              name: cp.name,
              level: 1,
            };
          });
          setProvinces(merged);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục hoặc đơn vị hành chính:', err);
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  // Tự động chọn danh mục theo tham số trên URL (ví dụ: ?category=O_NHIEM_NUOC) hoặc mặc định
  useEffect(() => {
    if (categories.length > 0) {
      if (categoryParam) {
        const matchedCat = categories.find(
          (c) =>
            c.code.toLowerCase() === categoryParam.toLowerCase() ||
            c.id.toLowerCase() === categoryParam.toLowerCase() ||
            c.name.toLowerCase() === categoryParam.toLowerCase()
        );
        if (matchedCat) {
          setCategoryId(matchedCat.id);
          return;
        }
      }

      // Nếu không có tham số URL hoặc không tìm thấy khớp, giữ categoryId hiện tại nếu hợp lệ, ngược lại dùng mặc định VI_PHAM_IUU
      setCategoryId((prevId) => {
        if (prevId && categories.some((c) => c.id === prevId)) return prevId;
        const defaultCat = categories.find((c) => c.code === 'VI_PHAM_IUU') || categories[0];
        return defaultCat ? defaultCat.id : '';
      });
    }
  }, [categories, categoryParam]);

  // Helper tính toán và tạo chuỗi vị trí định dạng chuẩn
  const computeFormattedLocation = useCallback((): string => {
    const prov = provinces.find((p) => p.id === administrativeUnitId);
    const provName = prov ? prov.name : '';

    if (locationType === 'LAND_COASTAL') {
      const gpsPart = gpsCoordinates ? `[GPS: ${gpsCoordinates}]` : '';
      const parts = [
        detailAddress.trim(),
        wardName.trim() ? `Xã/Phường ${wardName.trim()}` : '',
        districtName.trim() ? `Huyện/Quận ${districtName.trim()}` : '',
        provName,
        gpsPart,
      ].filter(Boolean);
      return parts.length > 0 ? `[Ven bờ/Đất liền] ${parts.join(', ')}` : (location || 'Trên đất liền / Ven bờ');
    }

    if (locationType === 'FISHING_PORT') {
      const port = MAJOR_FISHING_PORTS.find((p) => p.id === selectedPortId);
      const portName = selectedPortId === 'PORT_OTHER' ? (customPortName.trim() || 'Cảng cá khác') : (port?.name || '');
      const parts = [
        portName,
        portPosition.trim() ? `Vị trí: ${portPosition.trim()}` : '',
        port?.wardName || wardName.trim(),
        port?.districtName || districtName.trim(),
        provName || port?.provinceName,
      ].filter(Boolean);
      return `[Cảng cá] ${parts.join(', ')}`;
    }

    if (locationType === 'OFFSHORE_SEA') {
      const zone = SEA_ZONES.find((z) => z.id === seaZoneId);
      const fg = FISHING_GROUNDS.find((f) => f.id === fishingGroundId);
      const distStr = distanceNauticalMiles ? `Cách bờ ~${distanceNauticalMiles} hải lý (${oceanDirection})` : '';
      const gpsStr = gpsCoordinates ? `(GPS: ${gpsCoordinates})` : '';

      const parts = [
        fg?.name || 'Ngư trường xa bờ',
        distStr,
        gpsStr,
        zone?.name,
        provName ? `Đơn vị tiếp nhận: ${provName}` : '',
      ].filter(Boolean);
      return `[Trên biển] ${parts.join(' - ')}`;
    }

    return location;
  }, [
    locationType,
    administrativeUnitId,
    provinces,
    detailAddress,
    wardName,
    districtName,
    selectedPortId,
    customPortName,
    portPosition,
    seaZoneId,
    fishingGroundId,
    distanceNauticalMiles,
    oceanDirection,
    gpsCoordinates,
  ]);

  // Xử lý khi chọn một Cảng cá từ Dropdown
  const handlePortChange = (portId: string) => {
    setSelectedPortId(portId);
    if (portId !== 'PORT_OTHER') {
      const port = MAJOR_FISHING_PORTS.find((p) => p.id === portId);
      if (port) {
        if (port.provinceCode && provinces.length > 0) {
          const matchedProv = provinces.find((p) => p.code === port.provinceCode);
          if (matchedProv) setAdministrativeUnitId(matchedProv.id);
        }
        if (port.districtName) setDistrictName(port.districtName);
        if (port.wardName) setWardName(port.wardName);
        if (port.coords) setGpsCoordinates(port.coords);
      }
    }
  };

  // Tự động đồng bộ location string mỗi khi dữ liệu vị trí thay đổi
  useEffect(() => {
    const formatted = computeFormattedLocation();
    setLocation(formatted);
  }, [computeFormattedLocation]);

  // Update citizen details when user state changes
  useEffect(() => {
    if (user) {
      setCitizenName(user.fullName || '');
      setCitizenPhone(user.phoneNumber || '');
      setCitizenEmail(user.email || '');
    }
  }, [user]);

  // Handle GPS location detection + Reverse Geocode tự động điền địa bàn
  const handleGetGps = async () => {
    setIsGettingGps(true);

    // Hàm reverse geocode đa tầng: BigDataCloud (chuẩn VN, cực nhanh, không chặn DNS) -> OSM -> Fallback nội bộ
    const reverseGeocode = async (lat: number, lng: number) => {
      // Đảm bảo chuyển về chế độ Ven bờ / Đất liền để người dân thấy ngay các trường địa bàn
      setLocationType('LAND_COASTAL');

      let matchedProvId: number | undefined;
      let detectedDistrict = '';
      let detectedWard = '';
      let detectedDetail = '';

      // Tầng 1: BigDataCloud Client Reverse Geocode API (Miễn phí, hỗ trợ tiếng Việt bản xứ, không chặn DNS tại VN)
      try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`;
        const res = await fetch(bdcUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          const stateName = data.principalSubdivision || '';

          // Kiểm tra và so khớp với 28 Tỉnh/Thành phố ven biển Việt Nam
          if (stateName) {
            const normalize = (s: string) =>
              s.replace(/^(Tỉnh|Thành phố|TP\.?)\s*/i, '').trim().toLowerCase();
            const stateNorm = normalize(stateName);
            const matched = provinces.find(
              (p) =>
                normalize(p.name) === stateNorm ||
                p.name.toLowerCase().includes(stateNorm) ||
                stateNorm.includes(normalize(p.name))
            );

            if (matched) {
              matchedProvId = matched.id;
              setLocationWarning(null); // Tỉnh ven biển hợp lệ!
            } else {
              // Tọa độ thuộc khu vực nội địa không có biển và không nuôi trồng thủy hải sản
              setLocationWarning(
                `Tọa độ định vị hiện tại thuộc địa bàn "${stateName}" - Đây là khu vực nội địa không thuộc phạm vi 28 tỉnh, thành phố ven biển và vùng quy hoạch bảo trợ nuôi trồng/khai thác thủy hải sản của Cục Thủy Sản. Hệ thống từ chối tiếp nhận xử lý phản ánh tại địa bàn này.`
              );
              setDistrictName('');
              setWardName('');
              setDetailAddress('');
              return;
            }
          }

          // Trích xuất Phường/Xã và Quận/Huyện từ administrative list
          if (Array.isArray(data.localityInfo?.administrative)) {
            for (const adm of data.localityInfo.administrative) {
              const name = (adm.name || '').trim();
              const desc = (adm.description || '').toLowerCase();
              const nameLower = name.toLowerCase();

              // Nhận diện Xã / Phường / Thị trấn
              if (
                desc.includes('xã') ||
                desc.includes('phường') ||
                desc.includes('thị trấn') ||
                nameLower.startsWith('xã ') ||
                nameLower.startsWith('phường ') ||
                nameLower.startsWith('thị trấn ') ||
                nameLower.startsWith('xa ') ||
                nameLower.startsWith('phuong ')
              ) {
                detectedWard = name.replace(/\s*\([^)]*\)/g, '').trim();
              }
              // Nhận diện Huyện / Quận / Thị xã / Thành phố trực thuộc
              else if (
                desc.includes('huyện') ||
                desc.includes('quận') ||
                desc.includes('thị xã') ||
                (desc.includes('thành phố') && adm.adminLevel && adm.adminLevel > 4) ||
                nameLower.startsWith('huyện ') ||
                nameLower.startsWith('quận ') ||
                nameLower.startsWith('thị xã ')
              ) {
                detectedDistrict = name.replace(/\s*\([^)]*\)/g, '').trim();
              }
            }
          }

          // Fallback tên xã/phường nếu administrative list chưa có
          if (!detectedWard && data.locality && !data.locality.toLowerCase().includes('việt nam')) {
            detectedWard = data.locality.replace(/\s*\([^)]*\)/g, '').trim();
          }

          // Fallback tên huyện nếu chưa có
          if (!detectedDistrict && data.city && data.city !== data.principalSubdivision && data.city !== detectedWard) {
            detectedDistrict = data.city.replace(/\s*\([^)]*\)/g, '').trim();
          }

          // Tìm địa chỉ chi tiết (tổ dân phố, xóm, thôn)
          if (Array.isArray(data.localityInfo?.administrative)) {
            const microAdmins = data.localityInfo.administrative.filter(
              (a: any) => a.adminLevel && a.adminLevel >= 7
            );
            if (microAdmins.length > 0) {
              detectedDetail = microAdmins.map((m: any) => m.name).join(', ');
            }
          }
        }
      } catch {
        // Tầng 1 gặp lỗi mạng, tiếp tục tầng 2
      }

      // Tầng 2: Fallback qua Nominatim (nếu máy có thể kết nối được)
      if (!detectedDistrict && !detectedWard && !matchedProvId) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi&addressdetails=1`,
            { headers: { 'User-Agent': 'AquaReflect/1.0' }, signal: AbortSignal.timeout(3000) }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data?.address;
            if (addr) {
              const stateName = addr.state || addr.province || '';
              if (stateName && provinces.length > 0) {
                const normalize = (s: string) =>
                  s.replace(/^(Tỉnh|Thành phố|TP\.?)\s*/i, '').trim().toLowerCase();
                const stateNorm = normalize(stateName);
                const matched = provinces.find(
                  (p) => normalize(p.name) === stateNorm || p.name.toLowerCase().includes(stateNorm)
                );
                if (matched) {
                  matchedProvId = matched.id;
                  setLocationWarning(null);
                } else {
                  setLocationWarning(
                    `Tọa độ định vị hiện tại thuộc địa bàn "${stateName}" - Đây là khu vực nội địa không thuộc phạm vi 28 tỉnh, thành phố ven biển và vùng quy hoạch bảo trợ nuôi trồng/khai thác thủy hải sản của Cục Thủy Sản. Hệ thống từ chối tiếp nhận xử lý phản ánh tại địa bàn này.`
                  );
                  return;
                }
              }
              detectedDistrict = addr.county || addr.city_district || addr.city || '';
              detectedWard = addr.suburb || addr.village || addr.quarter || addr.town || '';
              const parts: string[] = [];
              if (addr.house_number) parts.push(addr.house_number);
              if (addr.road) parts.push(addr.road);
              if (addr.hamlet) parts.push(addr.hamlet);
              if (parts.length > 0) detectedDetail = parts.join(', ');
            }
          }
        } catch {
          // Bỏ qua nếu Nominatim không kết nối được
        }
      }

      // Tầng 3: Fallback địa bàn nội bộ cho vùng trọng điểm Quảng Ngãi & duyên hải miền Trung
      if (!matchedProvId && provinces.length > 0) {
        const qng = provinces.find((p) => p.code === 'QNG') || provinces[0];
        if (qng) {
          matchedProvId = qng.id;
          setLocationWarning(null);
        }
      }
      if (!detectedDistrict && lat >= 14.8 && lat <= 15.5 && lng >= 108.4 && lng <= 109.3) {
        detectedDistrict = 'Huyện Bình Sơn';
      }
      if (!detectedWard && lat >= 15.15 && lat <= 15.35 && lng >= 108.75 && lng <= 108.95) {
        detectedWard = 'Xã Bình Châu';
      }
      if (!detectedDetail) {
        const areaName = detectedWard ? `${detectedWard}, ${detectedDistrict || ''}`.trim() : 'ven biển';
        detectedDetail = `Thực địa khu vực ${areaName} (tọa độ GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      }

      // Cập nhật toàn bộ các trường địa bàn vào Form
      if (matchedProvId) setAdministrativeUnitId(matchedProvId);
      if (detectedDistrict) setDistrictName(detectedDistrict);
      if (detectedWard) setWardName(detectedWard);
      if (detectedDetail) setDetailAddress(detectedDetail);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const coordsStr = `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
          setGpsCoordinates(coordsStr);

          // Reverse geocode tự động điền Tỉnh / Huyện / Xã / Địa chỉ chi tiết
          await reverseGeocode(lat, lng);
          setIsGettingGps(false);
        },
        async () => {
          // Xử lý khi trình duyệt không có GPS hoặc người dùng chặn định vị:
          // Dùng tọa độ thực địa Cửa biển Sa Kỳ làm vị trí giả lập chuẩn mực
          const fallbackLat = 15.2286;
          const fallbackLng = 108.8924;
          const fallbackCoords = "15.22860°N, 108.89240°E";
          setGpsCoordinates(fallbackCoords);

          await reverseGeocode(fallbackLat, fallbackLng);
          setIsGettingGps(false);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      const fallbackLat = 15.2286;
      const fallbackLng = 108.8924;
      const fallbackCoords = "15.22860°N, 108.89240°E";
      setGpsCoordinates(fallbackCoords);

      await reverseGeocode(fallbackLat, fallbackLng);
      setIsGettingGps(false);
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
      if (locationWarning) {
        setSubmitError('Vị trí tọa độ nằm ngoài phạm vi 28 tỉnh ven biển. Hệ thống từ chối tiếp nhận xử lý.');
        return false;
      }
      if (title.trim().length < 5) {
        setSubmitError('Tiêu đề phản ánh phải có ít nhất 5 ký tự.');
        return false;
      }
      if (!administrativeUnitId) {
        setSubmitError('Vui lòng chọn Tỉnh / Thành phố ven biển phụ trách hoặc nơi đăng ký tàu.');
        return false;
      }
      if (locationType === 'LAND_COASTAL') {
        if (!detailAddress.trim() && !wardName.trim() && !districtName.trim()) {
          setSubmitError('Vui lòng nhập Địa chỉ chi tiết / Tên ao nuôi / Cơ sở trên đất liền.');
          return false;
        }
      } else if (locationType === 'FISHING_PORT') {
        if (selectedPortId === 'PORT_OTHER' && !customPortName.trim()) {
          setSubmitError('Vui lòng nhập Tên cảng cá / bến cá khác.');
          return false;
        }
      } else if (locationType === 'OFFSHORE_SEA') {
        if (!distanceNauticalMiles.trim() && !gpsCoordinates.trim()) {
          setSubmitError('Vui lòng bấm nút "GPS tự động" hoặc nhập "Khoảng cách ước tính (Hải lý)".');
          return false;
        }
      }
      if (!location.trim() || location.trim().length < 5) {
        setSubmitError('Vui lòng hoàn tất thông tin địa điểm xảy ra sự việc.');
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
      setUploadProgress(0);
      setUploadSizeInfo(null);

      const formData = new FormData();
      formData.append('CategoryId', categoryId);
      formData.append('Title', title.trim());
      formData.append('Content', description.trim());
      formData.append('Description', description.trim());
      formData.append('AddressText', location.trim());
      formData.append('Location', location.trim());

      if (gpsCoordinates) {
        formData.append('GpsCoordinates', gpsCoordinates);
        // Tách chuỗi GPS để gửi Latitude và Longitude chuẩn số
        const decMatch = gpsCoordinates.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°?\s*[NS])?\s*[,;]\s*([+-]?\d+(?:\.\d+)?)\s*(?:°?\s*[EW])?/i);
        if (decMatch) {
          const lat = parseFloat(decMatch[1]);
          const lng = parseFloat(decMatch[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            formData.append('Latitude', lat.toString());
            formData.append('Longitude', lng.toString());
          }
        } else {
          const dmsMatch = gpsCoordinates.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"?\s*([NS])\s*[,;]\s*(\d+)°\s*(\d+)'\s*([\d.]+)"?\s*([EW])/i);
          if (dmsMatch) {
            let lat = parseInt(dmsMatch[1]) + parseInt(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600;
            if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
            let lng = parseInt(dmsMatch[5]) + parseInt(dmsMatch[6]) / 60 + parseFloat(dmsMatch[7]) / 3600;
            if (dmsMatch[8].toUpperCase() === 'W') lng = -lng;
            formData.append('Latitude', lat.toFixed(5));
            formData.append('Longitude', lng.toFixed(5));
          }
        }
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

      if (turnstileToken) {
        formData.append('TurnstileToken', turnstileToken);
      }
      if (honeypot) {
        formData.append('Honeypot', honeypot);
      }

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('Files', file);
      });

      const response = await petitionApi.createPetition(formData, (progressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);

          const loadedMb = (progressEvent.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (progressEvent.total / (1024 * 1024)).toFixed(1);
          setUploadSizeInfo({ loaded: `${loadedMb} MB`, total: `${totalMb} MB` });
        }
      });

      if (response.success && response.data) {
        const petitionData = response.data;
        setSubmittedPetition(petitionData);
        setActiveTrackingCode(petitionData.trackingCode);
        setTrackingCodeInput(petitionData.trackingCode);

        // Nếu đơn vô danh và có PIN → hiển thị PIN Modal trước
        // Sau khi người dùng đóng PIN Modal mới mở Receipt Modal
        if (petitionData.isAnonymous && petitionData.accessPin) {
          setPendingPin({
            trackingCode: petitionData.trackingCode,
            accessPin: petitionData.accessPin,
          });
          setShowPinModal(true);
        } else {
          setShowReceiptModal(true);
        }

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
      setUploadProgress(null);
      setUploadSizeInfo(null);
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

                {/* Thẻ chuyên mục đang chọn (giúp người dân luôn thấy lĩnh vực phản ánh) */}
                {selectedCategory && (
                  <div className="flex items-center justify-between p-2.5 px-3 bg-sky-50/80 border border-sky-200/80 rounded-xl text-xs animate-in fade-in">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#006194] bg-sky-100 px-1.5 py-0.5 rounded">
                        Lĩnh vực đã chọn
                      </span>
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800 truncate">
                        {getCategoryIcon(selectedCategory.code)}
                        <span className="truncate">{selectedCategory.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0 hidden sm:inline">
                        (Cam kết SLA: {selectedCategory.defaultSlaHours}h)
                      </span>
                    </div>
                    {formMode === 'wizard' && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[11px] font-bold text-[#006194] hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Đổi lĩnh vực
                      </button>
                    )}
                  </div>
                )}

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

                {/* LOẠI ĐỊA ĐIỂM (RADIO SELECTOR 3 CHẾ ĐỘ THÔNG MINH) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Phân loại môi trường địa điểm xảy ra sự việc <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Chế độ 1: Đất liền / Ven bờ */}
                    <div
                      onClick={() => setLocationType('LAND_COASTAL')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start space-x-3 select-none active:scale-[0.99] ${
                        locationType === 'LAND_COASTAL'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        checked={locationType === 'LAND_COASTAL'}
                        onChange={() => setLocationType('LAND_COASTAL')}
                        className="mt-1 accent-emerald-600 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Đất liền / Ven bờ</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ao nuôi, trại giống, kênh nước, cơ sở chế biến, ven ao...
                        </p>
                      </div>
                    </div>

                    {/* Chế độ 2: Cảng cá / Khu neo đậu */}
                    <div
                      onClick={() => setLocationType('FISHING_PORT')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start space-x-3 select-none active:scale-[0.99] ${
                        locationType === 'FISHING_PORT'
                          ? 'border-[#006194] bg-sky-50/80 ring-2 ring-[#006194]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        checked={locationType === 'FISHING_PORT'}
                        onChange={() => setLocationType('FISHING_PORT')}
                        className="mt-1 accent-[#006194] shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                          <Anchor className="w-4 h-4 text-[#006194]" />
                          <span>Cảng cá / Khu neo đậu</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Cảng Sa Kỳ, Thọ Quang, Sông Đốc, Hòn Rớ, Cửa Đại...
                        </p>
                      </div>
                    </div>

                    {/* Chế độ 3: Trên biển / Ngư trường */}
                    <div
                      onClick={() => setLocationType('OFFSHORE_SEA')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start space-x-3 select-none active:scale-[0.99] ${
                        locationType === 'OFFSHORE_SEA'
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        checked={locationType === 'OFFSHORE_SEA'}
                        onChange={() => setLocationType('OFFSHORE_SEA')}
                        className="mt-1 accent-indigo-600 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                          <Waves className="w-4 h-4 text-indigo-600" />
                          <span>Trên biển / Ngư trường</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ngư trường Hoàng Sa, Trường Sa, Vịnh Bắc Bộ, xa bờ...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* === FORM INPUT CHI TIẾT TƯƠNG ỨNG TỪNG CHẾ ĐỘ === */}

                {/* 1. TRÊN ĐẤT LIỀN / VEN BỜ */}
                {locationType === 'LAND_COASTAL' && (
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
                        <select
                          value={administrativeUnitId || ''}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setAdministrativeUnitId(val);
                            if (val) setLocationWarning(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                        >
                          <option value="">-- Chọn Tỉnh / Thành phố --</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>{prov.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Quận / Huyện / Thị xã</label>
                        <input
                          type="text"
                          value={districtName}
                          onChange={(e) => setDistrictName(e.target.value)}
                          placeholder="Ví dụ: Huyện Bình Sơn"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Phường / Xã / Thị trấn</label>
                        <input
                          type="text"
                          value={wardName}
                          onChange={(e) => setWardName(e.target.value)}
                          placeholder="Ví dụ: Xã Bình Châu"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Địa chỉ chi tiết / Tên ao nuôi / Cơ sở <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={detailAddress}
                        onChange={(e) => setDetailAddress(e.target.value)}
                        placeholder="Ví dụ: Đầm nuôi tôm Thôn Định Tân, gần mương cấp nước số 3..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                      />
                    </div>
                  </div>
                )}

                {/* 2. TẠI CẢNG CÁ / KHU NEO ĐẬU */}
                {locationType === 'FISHING_PORT' && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chọn Cảng cá / Khu neo đậu <span className="text-rose-500">*</span></label>
                        <select
                          value={selectedPortId}
                          onChange={(e) => handlePortChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#006194] bg-white focus:ring-2 focus:ring-[#006194]"
                        >
                          {MAJOR_FISHING_PORTS.map((port) => (
                            <option key={port.id} value={port.id}>
                              {port.name} {port.provinceName ? `(${port.provinceName})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tỉnh / Thành phố quản lý cảng</label>
                        <select
                          value={administrativeUnitId || ''}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setAdministrativeUnitId(val);
                            if (val) setLocationWarning(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                        >
                          <option value="">-- Chọn Tỉnh / Thành phố --</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>{prov.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedPortId === 'PORT_OTHER' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tên Cảng cá / Bến cá khác <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={customPortName}
                          onChange={(e) => setCustomPortName(e.target.value)}
                          placeholder="Nhập tên cảng cá / bến cá..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Vị trí cụ thể tại cảng cá</label>
                      <input
                        type="text"
                        value={portPosition}
                        onChange={(e) => setPortPosition(e.target.value)}
                        placeholder="Ví dụ: Bến số 2, Cầu cảng bốc dỡ hải sản, Khu neo đậu âu thuyền phía Tây..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#006194]"
                      />
                    </div>
                  </div>
                )}

                {/* 3. TRÊN BIỂN / NGƯ TRƯỜNG */}
                {locationType === 'OFFSHORE_SEA' && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Ngư trường khai thác trọng điểm <span className="text-rose-500">*</span></label>
                        <select
                          value={fishingGroundId}
                          onChange={(e) => setFishingGroundId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-600"
                        >
                          {FISHING_GROUNDS.map((fg) => (
                            <option key={fg.id} value={fg.id}>{fg.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Vùng biển nghề cá</label>
                        <select
                          value={seaZoneId}
                          onChange={(e) => setSeaZoneId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                        >
                          {SEA_ZONES.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Khoảng cách ước tính (Hải lý)</label>
                        <input
                          type="text"
                          value={distanceNauticalMiles}
                          onChange={(e) => setDistanceNauticalMiles(e.target.value)}
                          placeholder="Ví dụ: 25 hoặc 45"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Hướng hải lưu / Gió</label>
                        <select
                          value={oceanDirection}
                          onChange={(e) => setOceanDirection(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="Đông">Hướng Đông</option>
                          <option value="Đông Nam">Hướng Đông Nam</option>
                          <option value="Đông Bắc">Hướng Đông Bắc</option>
                          <option value="Nam">Hướng Nam</option>
                          <option value="Tây Nam">Hướng Tây Nam</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tỉnh ven biển tiếp nhận / Đăng ký tàu <span className="text-rose-500">*</span></label>
                        <select
                          value={administrativeUnitId || ''}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setAdministrativeUnitId(val);
                            if (val) setLocationWarning(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="">-- Chọn Tỉnh / Thành phố --</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>{prov.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TỌA ĐỘ GPS & ĐƯỜNG DẪN ĐỊA ĐIỂM CHUẨN NÓNG */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <Compass className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tọa độ thực địa / GPS VMS</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGetGps}
                        disabled={isGettingGps}
                        className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#006194] bg-sky-50 hover:bg-sky-100 active:scale-95 px-2.5 py-0.5 rounded-lg transition-all border border-sky-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-2xs"
                      >
                        <MapPin className={`w-3 h-3 text-[#006194] ${isGettingGps ? 'animate-bounce' : ''}`} />
                        <span>{isGettingGps ? 'Đang định vị & quét địa chỉ...' : 'GPS tự động 1 chạm'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      placeholder="Ví dụ: 15°13'45.2&quot;N, 108°52'10.5&quot;E"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#006194]" />
                      <span>Chuỗi địa điểm tự động tổng hợp</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={location}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-[#006194] bg-slate-100/80 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* CẢNH BÁO TỪ CHỐI TIẾP NHẬN NẾU TỌA ĐỘ NGOÀI PHẠM VI 28 TỈNH VEN BIỂN */}
                {locationWarning && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-2 animate-in fade-in shadow-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-base">
                        ⚠️
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-rose-900">
                            Thông Báo: Ngoài Phạm Vi Tiếp Nhận & Xử Lý Thủy Sản
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-200/70 px-2 py-0.5 rounded-md border border-rose-300">
                            Từ chối thụ lý
                          </span>
                        </div>
                        <p className="text-rose-800 leading-relaxed font-medium">
                          {locationWarning}
                        </p>
                        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-rose-700">
                          <span className="font-bold">Quy định thẩm quyền:</span>
                          <span>Hệ thống chỉ tiếp nhận xử lý sự cố tại 28 tỉnh, thành phố ven biển và vùng biển Việt Nam. Nếu phát hiện sai sót định vị, vui lòng chọn lại tỉnh ven biển hoặc tắt định vị để nhập thủ công.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                {/* BẢO MẬT CHỐNG SPAM (TURNSTILE & HONEYPOT) */}
                <div className="pt-2">
                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                  />
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="opacity-0 absolute pointer-events-none -z-50 h-0 w-0"
                  />
                </div>
                {/* THANH TIẾN ĐỘ UPLOAD TỆP ĐÍNH KÈM THỜI GIAN THỰC (PROGRESS BAR) */}
                {isSubmitting && uploadProgress !== null && (
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2.5 shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold text-[#006194]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#006194] shrink-0" />
                        <span>
                          {uploadProgress < 100
                            ? `Đang tải ảnh/video minh chứng... ${uploadProgress}%`
                            : 'Đang mã hóa & khởi tạo mã tra cứu... 100%'}
                        </span>
                      </div>
                      {uploadSizeInfo && (
                        <span className="text-[11px] font-mono text-slate-600 font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-sky-100">
                          {uploadSizeInfo.loaded} / {uploadSizeInfo.total}
                        </span>
                      )}
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-[#006194] transition-all duration-300 ease-out rounded-full shadow-xs"
                        style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      {uploadProgress < 100
                        ? 'Đang truyền dữ liệu hình ảnh/video hiện trường từ thiết bị... Vui lòng không đóng trang.'
                        : 'Hoàn tất tải tệp. Hệ thống đang tiến hành cấp mã biên nhận QR...'}
                    </p>
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

      {/* ================================================================ */}
      {/* MODAL PIN BẢO MẬT VÔ DANH — Hiển thị TRƯỚC biên nhận               */}
      {/* Sau khi người dùng xác nhận lưu PIN, mới mở PetitionReceiptModal    */}
      {/* ================================================================ */}
      {showPinModal && pendingPin && (
        <AnonymousPinModal
          trackingCode={pendingPin.trackingCode}
          accessPin={pendingPin.accessPin}
          onClose={() => {
            setShowPinModal(false);
            setPendingPin(null);
            setShowReceiptModal(true); // Mở receipt modal sau khi đóng PIN modal
          }}
        />
      )}

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
