export interface FishingPortItem {
  id: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  type: 'Cảng cá loại I' | 'Cảng cá loại II' | 'Khu neo đậu tránh trú bão';
  coords: string;
}

export interface SeaZoneItem {
  id: string;
  name: string;
  description: string;
}

export interface FishingGroundItem {
  id: string;
  name: string;
  region: string;
  description: string;
}

// Danh sách Cảng cá & Khu neo đậu tránh trú bão lớn toàn quốc
export const MAJOR_FISHING_PORTS: FishingPortItem[] = [
  {
    id: 'PORT_SA_KY',
    name: 'Khu neo đậu tránh trú bão & Cảng cá Sa Kỳ',
    provinceCode: 'QNG',
    provinceName: 'Tỉnh Quảng Ngãi',
    districtName: 'Huyện Bình Sơn',
    wardName: 'Xã Bình Châu',
    type: 'Cảng cá loại I',
    coords: "15°13'45.2\"N, 108°52'10.5\"E",
  },
  {
    id: 'PORT_THO_QUANG',
    name: 'Âu thuyền & Cảng cá Thọ Quang',
    provinceCode: 'DNG',
    provinceName: 'TP. Đà Nẵng',
    districtName: 'Quận Sơn Trà',
    wardName: 'Phường Thọ Quang',
    type: 'Cảng cá loại I',
    coords: "16°06'35.0\"N, 108°14'15.0\"E",
  },
  {
    id: 'PORT_SONG_DOC',
    name: 'Cảng cá & Âu thuyền Sông Đốc',
    provinceCode: 'CMU',
    provinceName: 'Tỉnh Cà Mau',
    districtName: 'Huyện Trần Văn Thời',
    wardName: 'Thị trấn Sông Đốc',
    type: 'Cảng cá loại I',
    coords: "09°04'12.0\"N, 104°58'30.0\"E",
  },
  {
    id: 'PORT_HON_RO',
    name: 'Cảng cá Hòn Rớ (Nha Trang)',
    provinceCode: 'KHA',
    provinceName: 'Tỉnh Khánh Hòa',
    districtName: 'TP. Nha Trang',
    wardName: 'Xã Phước Đồng',
    type: 'Cảng cá loại I',
    coords: "12°12'18.0\"N, 109°11'42.0\"E",
  },
  {
    id: 'PORT_CUA_DAI',
    name: 'Cảng cá Cửa Đại',
    provinceCode: 'QNM',
    provinceName: 'Tỉnh Quảng Nam',
    districtName: 'TP. Hội An',
    wardName: 'Phường Cửa Đại',
    type: 'Cảng cá loại II',
    coords: "15°52'28.0\"N, 108°23'12.0\"E",
  },
  {
    id: 'PORT_AN_THOI',
    name: 'Khu neo đậu tàu thuyền An Thới',
    provinceCode: 'KGG',
    provinceName: 'Tỉnh Kiên Giang',
    districtName: 'TP. Phú Quốc',
    wardName: 'Phường An Thới',
    type: 'Khu neo đậu tránh trú bão',
    coords: "10°00'50.0\"N, 104°00'45.0\"E",
  },
  {
    id: 'PORT_CAT_LO',
    name: 'Cảng cá Cát Lở (Vũng Tàu)',
    provinceCode: 'VTU',
    provinceName: 'Tỉnh Bà Rịa - Vũng Tàu',
    districtName: 'TP. Vũng Tàu',
    wardName: 'Phường 11',
    type: 'Cảng cá loại I',
    coords: "10°24'15.0\"N, 107°08'30.0\"E",
  },
  {
    id: 'PORT_QUY_NHON',
    name: 'Cảng cá Quy Nhơn',
    provinceCode: 'BDH',
    provinceName: 'Tỉnh Bình Định',
    districtName: 'TP. Quy Nhơn',
    wardName: 'Phường Hải Cảng',
    type: 'Cảng cá loại I',
    coords: "13°46'10.0\"N, 109°14'20.0\"E",
  },
  {
    id: 'PORT_TAM_QUANG',
    name: 'Cảng cá Tam Quang',
    provinceCode: 'QNM',
    provinceName: 'Tỉnh Quảng Nam',
    districtName: 'Huyện Núi Thành',
    wardName: 'Xã Tam Quang',
    type: 'Cảng cá loại I',
    coords: "15°26'15.0\"N, 108°40'50.0\"E",
  },
  {
    id: 'PORT_TINH_HOA',
    name: 'Cảng cá Tịnh Hòa',
    provinceCode: 'QNG',
    provinceName: 'Tỉnh Quảng Ngãi',
    districtName: 'TP. Quảng Ngãi',
    wardName: 'Xã Tịnh Hòa',
    type: 'Cảng cá loại II',
    coords: "15°11'20.0\"N, 108°53'15.0\"E",
  },
  {
    id: 'PORT_MY_A',
    name: 'Khu neo đậu tránh trú bão Mỹ Á',
    provinceCode: 'QNG',
    provinceName: 'Tỉnh Quảng Ngãi',
    districtName: 'Thị xã Đức Phổ',
    wardName: 'Phường Phổ Quang',
    type: 'Khu neo đậu tránh trú bão',
    coords: "14°51 me'10.0\"N, 108°58'20.0\"E",
  },
  {
    id: 'PORT_OTHER',
    name: '📍 Cảng cá / Âu thuyền khác (Nhập tên thủ công)',
    provinceCode: '',
    provinceName: '',
    districtName: '',
    wardName: '',
    type: 'Cảng cá loại II',
    coords: '',
  },
];

// Danh sách Vùng biển nghề cá Việt Nam
export const SEA_ZONES: SeaZoneItem[] = [
  { id: 'ZONE_TONKIN', name: 'Vùng biển Vịnh Bắc Bộ', description: 'Quảng Ninh - Ninh Bình - Thanh Hóa - Nghệ An' },
  { id: 'ZONE_CENTRAL', name: 'Vùng biển Nam Trung Bộ', description: 'Đà Nẵng - Quảng Nam - Quảng Ngãi - Bình Định - Khánh Hòa' },
  { id: 'ZONE_SOUTHEAST', name: 'Vùng biển Đông Nam Bộ', description: 'Bà Rịa Vũng Tàu - TP.HCM - Tiền Giang - Cà Mau' },
  { id: 'ZONE_SOUTHWEST', name: 'Vùng biển Tây Nam Bộ', description: 'Cà Mau - Kiên Giang - Phú Quốc - Thổ Chu' },
  { id: 'ZONE_OFFSHORE', name: 'Vùng biển Quần đảo Hoàng Sa & Trường Sa', description: 'Vùng biển khơi xa bờ, giàn DK1 & đường cơ sở' },
];

// Danh sách Ngư trường trọng điểm Việt Nam
export const FISHING_GROUNDS: FishingGroundItem[] = [
  { id: 'FG_HOANG_SA', name: 'Ngư trường Quần đảo Hoàng Sa', region: 'Vùng biển khơi Trung Bộ', description: 'Vùng khai thác hải sản xa bờ, cá ngừ đại dương' },
  { id: 'FG_TRUONG_SA', name: 'Ngư trường Quần đảo Trường Sa & DK1', region: 'Vùng biển khơi Nam Trung Bộ', description: 'Khu vực khai thác mực đại dương, cá ngừ' },
  { id: 'FG_BACH_LONG_VI', name: 'Ngư trường Bạch Long Vĩ & Vịnh Bắc Bộ', region: 'Vùng biển phía Bắc', description: 'Vùng đánh bắt cá nổi, cá đáy và tôm hùm' },
  { id: 'FG_NINH_THUAN_BINH_THUAN', name: 'Ngư trường Ninh Thuận - Bình Thuận - Ba Bà', region: 'Duyên hải Nam Trung Bộ', description: 'Trọng điểm khai thác cá thu, cá trác, cá nục' },
  { id: 'FG_CON_DAO', name: 'Ngư trường Côn Đảo & Nam Biển Đông', region: 'Đông Nam Bộ', description: 'Vùng khai thác ghẹ, mực, cá ngừ vây vàng' },
  { id: 'FG_TAY_NAM', name: 'Ngư trường Tây Nam (Kiên Giang - Phú Quốc - Thổ Chu)', region: 'Tây Nam Bộ', description: 'Vùng biển nông giáp Campuchia & Malaysia' },
];

export interface PostMergerProvinceItem {
  id: number;
  code: string;
  name: string;
  region: 'Thành phố Trực thuộc Trung ương' | 'Miền Bắc và Trung du, ĐBSH' | 'Miền Trung và Tây Nguyên' | 'Miền Nam';
  note?: string;
  centerNote?: string;
  aliases: string[];
  hasAquaculture: boolean;
  centerCoords?: { lat: number; lng: number; zoom: number };
}

export interface RegionCenterItem {
  id: string;
  name: string;
  centerCoords: { lat: number; lng: number; zoom: number };
}

export const VIETNAM_REGIONS: RegionCenterItem[] = [
  { id: 'ALL', name: 'Toàn quốc (34 Tỉnh/Thành)', centerCoords: { lat: 16.047079, lng: 108.206230, zoom: 6 } },
  { id: 'CENTRAL_CITIES', name: '6 Thành phố Trực thuộc Trung ương', centerCoords: { lat: 16.047079, lng: 108.206230, zoom: 6 } },
  { id: 'NORTH', name: 'Miền Bắc và Trung du, ĐBSH (13 Tỉnh)', centerCoords: { lat: 21.3000, lng: 105.5000, zoom: 7 } },
  { id: 'CENTRAL', name: 'Miền Trung và Tây Nguyên (9 Tỉnh)', centerCoords: { lat: 14.8000, lng: 108.4000, zoom: 7 } },
  { id: 'SOUTH', name: 'Miền Nam (6 Tỉnh)', centerCoords: { lat: 10.4000, lng: 106.2000, zoom: 8 } },
];

// Danh mục 34 Đơn vị hành chính cấp Tỉnh / Thành phố Việt Nam sau sáp nhập
export const POST_MERGER_PROVINCES_34: PostMergerProvinceItem[] = [
  // --- 1. CÁC THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG (6) ---
  {
    id: 1,
    code: 'HN',
    name: 'Thành phố Hà Nội',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Thủ đô Hà Nội (đã sáp nhập Hà Tây & Mê Linh)',
    aliases: ['hà nội', 'ha noi', 'hanoi', 'hà tây', 'ha tay'],
    hasAquaculture: true,
    centerCoords: { lat: 21.0285, lng: 105.8542, zoom: 11 },
  },
  {
    id: 2,
    code: 'HCM',
    name: 'Thành phố Hồ Chí Minh',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Hợp nhất TP.HCM, Bình Dương, Bà Rịa - Vũng Tàu',
    aliases: ['hồ chí minh', 'ho chi minh', 'tp hcm', 'tphcm', 'sài gòn', 'sai gon', 'bình dương', 'binh duong', 'bà rịa - vũng tàu', 'bà rịa vũng tàu', 'ba ria vung tau', 'vũng tàu', 'vung tau'],
    hasAquaculture: true,
    centerCoords: { lat: 10.7769, lng: 106.7009, zoom: 10 },
  },
  {
    id: 3,
    code: 'DNG',
    name: 'Thành phố Đà Nẵng',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Hợp nhất TP.Đà Nẵng, Quảng Nam',
    aliases: ['đà nẵng', 'da nang', 'danang', 'quảng nam', 'quang nam'],
    hasAquaculture: true,
    centerCoords: { lat: 15.8801, lng: 108.3380, zoom: 10 },
  },
  {
    id: 4,
    code: 'HPH',
    name: 'Thành phố Hải Phòng',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Hợp nhất TP.Hải Phòng, Hải Dương',
    aliases: ['hải phòng', 'hai phong', 'haiphong', 'hải dương', 'hai duong'],
    hasAquaculture: true,
    centerCoords: { lat: 20.8449, lng: 106.6881, zoom: 10 },
  },
  {
    id: 5,
    code: 'CTO',
    name: 'Thành phố Cần Thơ',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Hợp nhất Cần Thơ, Sóc Trăng, Hậu Giang',
    aliases: ['cần thơ', 'can tho', 'cantho', 'sóc trăng', 'soc trang', 'hậu giang', 'hau giang'],
    hasAquaculture: true,
    centerCoords: { lat: 9.7836, lng: 105.6189, zoom: 10 },
  },
  {
    id: 6,
    code: 'HUE',
    name: 'Thành phố Huế',
    region: 'Thành phố Trực thuộc Trung ương',
    note: 'Đô thị di sản trực thuộc Trung ương',
    aliases: ['huế', 'hue', 'thừa thiên huế', 'thừa thiên - huế', 'thua thien hue'],
    hasAquaculture: true,
    centerCoords: { lat: 16.4637, lng: 107.5909, zoom: 11 },
  },

  // --- 2. CÁC TỈNH MIỀN BẮC VÀ TRUNG DU, ĐỒNG BẰNG SÔNG HỒNG (13) ---
  {
    id: 7,
    code: 'TQ',
    name: 'Tỉnh Tuyên Quang',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Hà Giang, Tuyên Quang',
    aliases: ['tuyên quang', 'tuyen quang', 'hà giang', 'ha giang'],
    hasAquaculture: true,
    centerCoords: { lat: 22.3168, lng: 105.1500, zoom: 9 },
  },
  {
    id: 8,
    code: 'LCA',
    name: 'Tỉnh Lào Cai',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Lào Cai, Yên Bái (Trung tâm tại Yên Bái)',
    centerNote: 'Trung tâm tại Yên Bái',
    aliases: ['lào cai', 'lao cai', 'yên bái', 'yen bai'],
    hasAquaculture: true,
    centerCoords: { lat: 22.0000, lng: 104.5000, zoom: 9 },
  },
  {
    id: 9,
    code: 'TNG',
    name: 'Tỉnh Thái Nguyên',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Bắc Kạn, Thái Nguyên',
    aliases: ['thái nguyên', 'thai nguyen', 'bắc kạn', 'bắc cạn', 'bac kan', 'bac can'],
    hasAquaculture: true,
    centerCoords: { lat: 21.8000, lng: 105.8000, zoom: 9 },
  },
  {
    id: 10,
    code: 'PTO',
    name: 'Tỉnh Phú Thọ',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Vĩnh Phúc, Phú Thọ, Hòa Bình',
    aliases: ['phú thọ', 'phu tho', 'vĩnh phúc', 'vinh phuc', 'hòa bình', 'hoa binh'],
    hasAquaculture: true,
    centerCoords: { lat: 21.1500, lng: 105.2000, zoom: 9 },
  },
  {
    id: 11,
    code: 'BNI',
    name: 'Tỉnh Bắc Ninh',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Bắc Giang, Bắc Ninh (Trung tâm tại Bắc Giang)',
    centerNote: 'Trung tâm tại Bắc Giang',
    aliases: ['bắc ninh', 'bac ninh', 'bắc giang', 'bac giang'],
    hasAquaculture: true,
    centerCoords: { lat: 21.2500, lng: 106.2000, zoom: 10 },
  },
  {
    id: 12,
    code: 'HYE',
    name: 'Tỉnh Hưng Yên',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Thái Bình, Hưng Yên',
    aliases: ['hưng yên', 'hung yen', 'thái bình', 'thai binh'],
    hasAquaculture: true,
    centerCoords: { lat: 20.6000, lng: 106.2000, zoom: 10 },
  },
  {
    id: 13,
    code: 'NBH',
    name: 'Tỉnh Ninh Bình',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Hợp nhất Hà Nam, Nam Định, Ninh Bình',
    aliases: ['ninh bình', 'ninh binh', 'hà nam', 'ha nam', 'nam định', 'nam dinh'],
    hasAquaculture: true,
    centerCoords: { lat: 20.3500, lng: 106.0500, zoom: 10 },
  },
  {
    id: 14,
    code: 'QNI',
    name: 'Tỉnh Quảng Ninh',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['quảng ninh', 'quang ninh'],
    hasAquaculture: true,
    centerCoords: { lat: 21.2500, lng: 107.3000, zoom: 9 },
  },
  {
    id: 15,
    code: 'LSN',
    name: 'Tỉnh Lạng Sơn',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['lạng sơn', 'lang son'],
    hasAquaculture: true,
    centerCoords: { lat: 21.8500, lng: 106.7500, zoom: 9 },
  },
  {
    id: 16,
    code: 'CBA',
    name: 'Tỉnh Cao Bằng',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['cao bằng', 'cao bang'],
    hasAquaculture: true,
    centerCoords: { lat: 22.6500, lng: 106.2500, zoom: 9 },
  },
  {
    id: 17,
    code: 'LCH',
    name: 'Tỉnh Lai Châu',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['lai châu', 'lai chau'],
    hasAquaculture: true,
    centerCoords: { lat: 22.4000, lng: 103.4500, zoom: 9 },
  },
  {
    id: 18,
    code: 'DBI',
    name: 'Tỉnh Điện Biên',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['điện biên', 'dien bien'],
    hasAquaculture: true,
    centerCoords: { lat: 21.3833, lng: 103.0167, zoom: 9 },
  },
  {
    id: 19,
    code: 'SLA',
    name: 'Tỉnh Sơn La',
    region: 'Miền Bắc và Trung du, ĐBSH',
    note: 'Giữ nguyên',
    aliases: ['sơn la', 'son la'],
    hasAquaculture: true,
    centerCoords: { lat: 21.3256, lng: 103.9189, zoom: 9 },
  },

  // --- 3. CÁC TỈNH MIỀN TRUNG VÀ TÂY NGUYÊN (9) ---
  {
    id: 20,
    code: 'THA',
    name: 'Tỉnh Thanh Hóa',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Giữ nguyên',
    aliases: ['thanh hóa', 'thanh hoa'],
    hasAquaculture: true,
    centerCoords: { lat: 19.8000, lng: 105.7800, zoom: 9 },
  },
  {
    id: 21,
    code: 'NAN',
    name: 'Tỉnh Nghệ An',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Giữ nguyên',
    aliases: ['nghệ an', 'nghe an'],
    hasAquaculture: true,
    centerCoords: { lat: 19.2500, lng: 104.9000, zoom: 9 },
  },
  {
    id: 22,
    code: 'HTI',
    name: 'Tỉnh Hà Tĩnh',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Giữ nguyên',
    aliases: ['hà tĩnh', 'ha tinh'],
    hasAquaculture: true,
    centerCoords: { lat: 18.3500, lng: 105.9000, zoom: 9 },
  },
  {
    id: 23,
    code: 'QTR',
    name: 'Tỉnh Quảng Trị',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Quảng Bình, Quảng Trị (Trung tâm tại Quảng Bình)',
    centerNote: 'Trung tâm tại Quảng Bình',
    aliases: ['quảng trị', 'quang tri', 'quảng bình', 'quang binh'],
    hasAquaculture: true,
    centerCoords: { lat: 17.2000, lng: 106.6000, zoom: 9 },
  },
  {
    id: 24,
    code: 'QNG',
    name: 'Tỉnh Quảng Ngãi',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Kon Tum, Quảng Ngãi (Trọng điểm)',
    aliases: ['quảng ngãi', 'quang ngai', 'kon tum', 'kontum'],
    hasAquaculture: true,
    centerCoords: { lat: 15.1205, lng: 108.7923, zoom: 10 },
  },
  {
    id: 25,
    code: 'GLA',
    name: 'Tỉnh Gia Lai',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Bình Định, Gia Lai (Trung tâm tại Bình Định)',
    centerNote: 'Trung tâm tại Bình Định',
    aliases: ['gia lai', 'gialai', 'bình định', 'binh dinh'],
    hasAquaculture: true,
    centerCoords: { lat: 13.9800, lng: 108.5000, zoom: 9 },
  },
  {
    id: 26,
    code: 'KHA',
    name: 'Tỉnh Khánh Hòa',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Ninh Thuận, Khánh Hòa',
    aliases: ['khánh hòa', 'khanh hoa', 'ninh thuận', 'ninh thuan'],
    hasAquaculture: true,
    centerCoords: { lat: 12.0000, lng: 109.1000, zoom: 9 },
  },
  {
    id: 27,
    code: 'LDG',
    name: 'Tỉnh Lâm Đồng',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Đắk Nông, Bình Thuận, Lâm Đồng',
    aliases: ['lâm đồng', 'lam dong', 'đắk nông', 'đắc nông', 'dak nong', 'daknong', 'bình thuận', 'binh thuan'],
    hasAquaculture: true,
    centerCoords: { lat: 11.5500, lng: 107.8000, zoom: 9 },
  },
  {
    id: 28,
    code: 'DLK',
    name: 'Tỉnh Đắk Lắk',
    region: 'Miền Trung và Tây Nguyên',
    note: 'Hợp nhất Phú Yên, Đắk Lắk',
    aliases: ['đắk lắk', 'đắc lắc', 'dak lak', 'daklak', 'darlac', 'phú yên', 'phu yen'],
    hasAquaculture: true,
    centerCoords: { lat: 12.8000, lng: 108.6000, zoom: 9 },
  },

  // --- 4. CÁC TỈNH MIỀN NAM (6) ---
  {
    id: 29,
    code: 'DNA',
    name: 'Tỉnh Đồng Nai',
    region: 'Miền Nam',
    note: 'Hợp nhất Bình Phước, Đồng Nai',
    aliases: ['đồng nai', 'dong nai', 'bình phước', 'binh phuoc'],
    hasAquaculture: true,
    centerCoords: { lat: 11.4000, lng: 107.0000, zoom: 9 },
  },
  {
    id: 30,
    code: 'TNI',
    name: 'Tỉnh Tây Ninh',
    region: 'Miền Nam',
    note: 'Hợp nhất Long An, Tây Ninh (Trung tâm tại Long An)',
    centerNote: 'Trung tâm tại Long An',
    aliases: ['tây ninh', 'tay ninh', 'long an', 'longan'],
    hasAquaculture: true,
    centerCoords: { lat: 10.9000, lng: 106.1000, zoom: 9 },
  },
  {
    id: 31,
    code: 'DTH',
    name: 'Tỉnh Đồng Tháp',
    region: 'Miền Nam',
    note: 'Hợp nhất Tiền Giang, Đồng Tháp (Trung tâm tại Tiền Giang)',
    centerNote: 'Trung tâm tại Tiền Giang',
    aliases: ['đồng tháp', 'dong thap', 'tiền giang', 'tien giang'],
    hasAquaculture: true,
    centerCoords: { lat: 10.4500, lng: 106.0000, zoom: 10 },
  },
  {
    id: 32,
    code: 'VLO',
    name: 'Tỉnh Vĩnh Long',
    region: 'Miền Nam',
    note: 'Hợp nhất Bến Tre, Trà Vinh, Vĩnh Long',
    aliases: ['vĩnh long', 'vinh long', 'bến tre', 'ben tre', 'trà vinh', 'tra vinh'],
    hasAquaculture: true,
    centerCoords: { lat: 10.0500, lng: 106.2500, zoom: 10 },
  },
  {
    id: 33,
    code: 'AGI',
    name: 'Tỉnh An Giang',
    region: 'Miền Nam',
    note: 'Hợp nhất An Giang, Kiên Giang (Trung tâm tại Kiên Giang)',
    centerNote: 'Trung tâm tại Kiên Giang',
    aliases: ['an giang', 'angiang', 'kiên giang', 'kien giang'],
    hasAquaculture: true,
    centerCoords: { lat: 10.1500, lng: 105.1000, zoom: 9 },
  },
  {
    id: 34,
    code: 'CMA',
    name: 'Tỉnh Cà Mau',
    region: 'Miền Nam',
    note: 'Hợp nhất Bạc Liêu, Cà Mau',
    aliases: ['cà mau', 'ca mau', 'bạc liêu', 'bac lieu'],
    hasAquaculture: true,
    centerCoords: { lat: 9.1769, lng: 105.1524, zoom: 10 },
  },
];

// Helper chuẩn hóa chuỗi để so khớp tên địa bàn
export function normalizeAdminString(str: string): string {
  if (!str) return '';
  return str
    .replace(/^(tỉnh|thành phố|thành phố trực thuộc trung ương|tp\.?)\s*/i, '')
    .trim()
    .toLowerCase();
}

// Hàm ánh xạ tên tỉnh cũ / kết quả reverse-geocode sang tỉnh sau sáp nhập
export function resolvePostMergerProvince(rawStateName: string): PostMergerProvinceItem | undefined {
  if (!rawStateName) return undefined;
  const cleanInput = normalizeAdminString(rawStateName);

  // 1. So khớp trực tiếp tên tỉnh chính thức
  const exactMatch = POST_MERGER_PROVINCES_34.find(
    (p) => normalizeAdminString(p.name) === cleanInput
  );
  if (exactMatch) return exactMatch;

  // 2. So khớp qua danh sách các tỉnh cũ hợp nhất (aliases)
  const aliasMatch = POST_MERGER_PROVINCES_34.find((p) =>
    p.aliases.some((alias) => {
      const cleanAlias = normalizeAdminString(alias);
      return cleanInput === cleanAlias || cleanInput.includes(cleanAlias) || cleanAlias.includes(cleanInput);
    })
  );
  if (aliasMatch) return aliasMatch;

  // 3. So khớp một phần tên chính thức
  return POST_MERGER_PROVINCES_34.find(
    (p) => normalizeAdminString(p.name).includes(cleanInput) || cleanInput.includes(normalizeAdminString(p.name))
  );
}

export interface CoastalProvinceItem {
  id: number;
  code: string;
  name: string;
  region: string;
  hasAquaculture: boolean;
}

// Giữ lại alias tương thích ngược nếu các component khác cần dùng
export const VIETNAM_COASTAL_PROVINCES: CoastalProvinceItem[] = POST_MERGER_PROVINCES_34.map((p) => ({
  id: p.id,
  code: p.code,
  name: `${p.name}${p.note ? ` (${p.note})` : ''}`,
  region: p.region,
  hasAquaculture: p.hasAquaculture,
}));

