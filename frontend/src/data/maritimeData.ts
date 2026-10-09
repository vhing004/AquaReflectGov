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
