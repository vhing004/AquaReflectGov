export interface LegalDocument {
  id: string;
  code: string;
  title: string;
  issuingAuthority: string;
  issueDate: string;
  effectiveDate: string;
  signerTitle: string;
  signerName: string;
  summary: string;
  legalBases: string[];
  chapters: {
    chapterTitle: string;
    articles: {
      articleTitle: string;
      content: string[];
    }[];
  }[];
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  'Luật số 18/2017/QH14': {
    id: 'LAW_TS_2017',
    code: 'Luật số 18/2017/QH14',
    title: 'LUẬT THỦY SẢN',
    issuingAuthority: 'QUỐC HỘI NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '21/11/2017',
    effectiveDate: '01/01/2019',
    signerTitle: 'CHỦ TỊCH QUỐC HỘI',
    signerName: 'Nguyễn Thị Kim Ngân',
    summary: 'Quy định về hoạt động thủy sản; quyền và nghĩa vụ của tổ chức, cá nhân hoạt động thủy sản hoặc có liên quan đến hoạt động thủy sản; quản lý nhà nước về thủy sản.',
    legalBases: [
      'Căn cứ Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam;',
      'Quốc hội ban hành Luật Thủy sản.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương I: QUY ĐỊNH CHUNG',
        articles: [
          {
            articleTitle: 'Điều 1. Phạm vi điều chỉnh',
            content: [
              'Luật này quy định về hoạt động thủy sản; quyền và nghĩa vụ của tổ chức, cá nhân hoạt động thủy sản hoặc có liên quan đến hoạt động thủy sản; quản lý nhà nước về thủy sản.',
            ],
          },
          {
            articleTitle: 'Điều 7. Các hành vi bị nghiêm cấm trong hoạt động thủy sản',
            content: [
              '1. Hủy hoại nguồn lợi thủy sản, hệ sinh thái thủy sinh, khu bãi giống, nơi cư trú của các loài thủy sản.',
              '2. Sử dụng chất nổ, chất độc, xung điện, dòng điện, phương pháp cấm, nghề cấm, ngư cụ cấm để khai thác thủy sản.',
              '3. Sử dụng dịch bệnh, hóa chất cấm, chất độc hại để khai thác, nuôi trồng thủy sản.',
              '4. Khai thác hải sản bất hợp pháp, không báo cáo và không theo quy định (IUU).',
              '5. Tháo thiết bị giám sát hành trình (VMS) khi tàu cá hoạt động trên biển hoặc cố tình làm gián đoạn tín hiệu truyền dữ liệu VMS.',
            ],
          },
        ],
      },
      {
        chapterTitle: 'Chương II: BẢO VỆ VÀ PHÁT TRIỂN NGUỒN LỢI THỦY SẢN',
        articles: [
          {
            articleTitle: 'Điều 34. Điều kiện vùng nuôi trồng thủy sản tập trung',
            content: [
              '1. Nguồn nước nuôi trồng thủy sản phải đạt tiêu chuẩn kỹ thuật quy định về chất lượng nước.',
              '2. Có hệ thống cấp, thoát nước riêng biệt; có khu xử lý nước thải đạt tiêu chuẩn trước khi xả ra môi trường xung quanh.',
              '3. Đảm bảo an toàn sinh học và phòng chống dịch bệnh thủy sản lây lan.',
            ],
          },
        ],
      },
      {
        chapterTitle: 'Chương IV: KHAI THÁC THỦY SẢN VÀ QUẢN LÝ TÀU CÁ',
        articles: [
          {
            articleTitle: 'Điều 60. Quy định về Giám sát hành trình Tàu cá (VMS)',
            content: [
              '1. Tàu cá có chiều dài lớn nhất từ 15 mét trở lên phải lắp đặt thiết bị giám sát hành trình (VMS) và bật thiết bị 24/24 giờ khi hoạt động trên biển.',
              '2. Dữ liệu VMS được kết nối liên tục với Trạm bờ Chi cục Thủy sản và Tổng cục Thủy sản để giám sát vị trí.',
            ],
          },
        ],
      },
    ],
  },

  'Luật số 72/2020/QH14': {
    id: 'LAW_ENV_2020',
    code: 'Luật số 72/2020/QH14',
    title: 'LUẬT BẢO VỆ MÔI TRƯỜNG',
    issuingAuthority: 'QUỐC HỘI NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '17/11/2020',
    effectiveDate: '01/01/2022',
    signerTitle: 'CHỦ TỊCH QUỐC HỘI',
    signerName: 'Vương Đình Huệ',
    summary: 'Quy định về hoạt động bảo vệ môi trường; quyền, nghĩa vụ và trách nhiệm của cơ quan, tổ chức, hộ gia đình và cá nhân trong bảo vệ môi trường nước, đất, không khí và thủy sinh sinh thái.',
    legalBases: [
      'Căn cứ Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam;',
      'Quốc hội ban hành Luật Bảo vệ môi trường.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương II: BẢO VỆ MÔI TRƯỜNG NƯỚC VÀ NGUỒN NƯỚC NÔNG NGHIỆP',
        articles: [
          {
            articleTitle: 'Điều 52. Bảo vệ môi trường trong sản xuất nông nghiệp, nuôi trồng thủy sản',
            content: [
              '1. Tổ chức, cá nhân nuôi trồng thủy sản phải tuân thủ quy định về môi trường, không xả thải bùn ao, nước thải chưa qua xử lý xuống nguồn nước cấp sinh hoạt hoặc kênh rạch chung.',
              '2. Hóa chất, thuốc thú y thủy sản hết hạn hoặc vỏ bao bì phải được thu gom, xử lý theo quy định về chất thải nguy hại.',
              '3. Nghiêm cấm hành vi xả hóa chất độc hại gây ô nhiễm nghiêm trọng nguồn nước mặt vùng nuôi.',
            ],
          },
        ],
      },
    ],
  },

  'Nghị định 26/2019/NĐ-CP': {
    id: 'ND_26_2019',
    code: 'Nghị định 26/2019/NĐ-CP',
    title: 'NGHỊ ĐỊNH QUY ĐỊNH CHI TIẾT MỘT SỐ ĐIỀU VÀ BIỆN PHÁP THI HÀNH LUẬT THỦY SẢN',
    issuingAuthority: 'CHÍNH PHỦ NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '08/03/2019',
    effectiveDate: '25/04/2019',
    signerTitle: 'THỦ TƯỚNG CHÍNH PHỦ',
    signerName: 'Nguyễn Xuân Phúc',
    summary: 'Quy định chi tiết về điều kiện cơ sở sản xuất giống, thức ăn thủy sản; quy trình đăng ký, đăng kiểm tàu cá; quản lý giám sát tàu cá VMS và cấp Giấy phép khai thác hải sản.',
    legalBases: [
      'Căn cứ Luật Tổ chức Chính phủ ngày 19 tháng 6 năm 2015;',
      'Căn cứ Luật Thủy sản ngày 21 tháng 11 năm 2017;',
      'Theo đề nghị của Bộ trưởng Bộ Nông nghiệp và Phát triển nông thôn;',
      'Chính phủ ban hành Nghị định quy định chi tiết thi hành Luật Thủy sản.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương III: QUẢN LÝ GIỐNG THỦY SẢN VÀ THỨC ĂN THỦY SẢN',
        articles: [
          {
            articleTitle: 'Điều 22. Điều kiện cơ sở sản xuất, ươm dưỡng giống thủy sản',
            content: [
              '1. Cơ sở phải có cơ sở vật chất, trang thiết bị kỹ thuật phù hợp với loài thủy sản sản xuất.',
              '2. Có hệ thống cấp nước và xử lý nước thải riêng biệt đạt tiêu chuẩn an toàn sinh học.',
              '3. Đội ngũ kỹ thuật viên có bằng cấp chuyên môn về nuôi trồng thủy sản hoặc bệnh học thủy sản.',
            ],
          },
        ],
      },
      {
        chapterTitle: 'Chương V: QUẢN LÝ TÀU CÁ VÀ CẢNG CÁ',
        articles: [
          {
            articleTitle: 'Điều 44. Quy định về thiết bị Giám sát Hành trình (VMS)',
            content: [
              '1. Thiết bị VMS phải tự động truyền vị trí tàu cá về Trung tâm dữ liệu giám sát với tần suất tối thiểu 02 giờ/lần đối với tàu từ 24 mét trở lên, và 01 giờ/lần khi vượt ranh giới vùng biển cho phép.',
              '2. Trong trường hợp hỏng thiết bị VMS trên biển, thuyền trưởng phải sử dụng các thiết bị liên lạc khác báo cáo vị trí về Trạm bờ 06 giờ/lần và phải đưa tàu về cảng sửa chữa trong vòng 10 ngày.',
            ],
          },
        ],
      },
    ],
  },

  'Nghị định 42/2019/NĐ-CP': {
    id: 'ND_42_2019',
    code: 'Nghị định 42/2019/NĐ-CP',
    title: 'NGHỊ ĐỊNH QUY ĐỊNH XỬ PHẠT VI PHẠM HÀNH CHÍNH TRONG LĨNH VỰC THỦY SẢN',
    issuingAuthority: 'CHÍNH PHỦ NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '16/05/2019',
    effectiveDate: '05/07/2019',
    signerTitle: 'THỦ TƯỚNG CHÍNH PHỦ',
    signerName: 'Nguyễn Xuân Phúc',
    summary: 'Quy định các hành vi vi phạm hành chính, hình thức xử phạt, mức phạt tiền (khung phạt vi phạm khai thác IUU tối đa đến 1.000.000.000 đồng), biện pháp khắc phục hậu quả trong lĩnh vực thủy sản.',
    legalBases: [
      'Căn cứ Luật Tổ chức Chính phủ ngày 19 tháng 6 năm 2015;',
      'Căn cứ Luật Xử lý vi phạm hành chính ngày 20 tháng 6 năm 2012;',
      'Căn cứ Luật Thủy sản ngày 21 tháng 11 năm 2017;',
      'Chính phủ ban hành Nghị định xử phạt vi phạm hành chính trong lĩnh vực thủy sản.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương II: HÀNH VI VI PHẠM HÀNH CHÍNH, HÌNH THỨC XỬ PHẠT VÀ MỨC PHẠT',
        articles: [
          {
            articleTitle: 'Điều 20. Vi phạm quy định về Khai thác hải sản trái phép (IUU)',
            content: [
              '1. Phạt tiền từ 300.000.000 đồng đến 500.000.000 đồng đối với hành vi không duy trì hoạt động hoặc tháo thiết bị VMS khi hoạt động trên biển.',
              '2. Phạt tiền từ 800.000.000 đồng đến 1.000.000.000 đồng đối với hành vi khai thác hải sản tại vùng biển của quốc gia hoặc vùng lãnh thổ khác mà không có giấy phép.',
              '3. Hình thức phạt bổ sung: Tước quyền sử dụng Giấy phép khai thác thủy sản từ 06 tháng đến 12 tháng, tịch thu tàu cá vi phạm.',
            ],
          },
          {
            articleTitle: 'Điều 31. Vi phạm quy định về bảo vệ môi trường vùng nuôi',
            content: [
              '1. Phạt tiền từ 10.000.000 đồng đến 20.000.000 đồng đối với hành vi xả thải nước ao nuôi chưa qua xử lý làm lây lan dịch bệnh.',
              '2. Buộc thực hiện biện pháp khắc phục hậu quả: Tiêu độc khử trùng và xử lý đạt tiêu chuẩn kỹ thuật trước khi xả ra môi trường.',
            ],
          },
        ],
      },
    ],
  },

  'Thông tư 04/2016/TT-BNNPTNT': {
    id: 'TT_04_2016',
    code: 'Thông tư 04/2016/TT-BNNPTNT',
    title: 'THÔNG TƯ QUY ĐỊNH VỀ PHÒNG, CHỐNG DỊCH BỆNH ĐỘNG VẬT THỦY SẢN',
    issuingAuthority: 'BỘ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN',
    issueDate: '31/05/2016',
    effectiveDate: '15/07/2016',
    signerTitle: 'BỘ TRƯỞNG',
    signerName: 'Cao Đức Phát',
    summary: 'Quy định danh mục bệnh thủy sản phải công bố dịch, công tác giám sát, điều tra ổ dịch, xử lý tiêu hủy và cấp hóa chất dập dịch khẩn cấp.',
    legalBases: [
      'Căn cứ Luật Thú y ngày 19 tháng 6 năm 2015;',
      'Căn cứ Nghị định 199/2013/NĐ-CP quy định chức năng, nhiệm vụ Bộ Nông nghiệp và PTNT;',
      'Bộ trưởng Bộ Nông nghiệp và Phát triển nông thôn ban hành Thông tư.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương II: GIÁM SÁT VÀ XỬ LÝ Ổ DỊCH THỦY SẢN',
        articles: [
          {
            articleTitle: 'Điều 8. Báo cáo dịch bệnh và lấy mẫu xét nghiệm',
            content: [
              '1. Khi phát hiện tôm cá nuôi có dấu hiệu mắc bệnh truyền nhiễm nguy hiểm, hộ nuôi phải báo ngay cho Thú y viên xã/phường hoặc Cơ quan Thú y nơi gần nhất trong vòng 24 giờ.',
              '2. Trạm Thú y cử cán bộ thu mẫu gửi phòng thử nghiệm PCR chẩn đoán khẩn cấp.',
            ],
          },
        ],
      },
    ],
  },

  'QCVN 38:2011/BTNMT': {
    id: 'QCVN_38_2011',
    code: 'QCVN 38:2011/BTNMT',
    title: 'QUY CHUẨN KỸ THUẬT QUỐC GIA VỀ CHẤT LƯỢNG NƯỚC MẶT BẢO VỆ ĐỘNG VẬT THỦY SẢN',
    issuingAuthority: 'BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG',
    issueDate: '12/12/2011',
    effectiveDate: '01/06/2012',
    signerTitle: 'BỘ TRƯỞNG',
    signerName: 'Nguyễn Minh Quang',
    summary: 'Quy định giá trị giới hạn các thông số chất lượng nước mặt dùng cho mục đích bảo vệ sinh trưởng và phát triển của động vật thủy sản nuôi và tự nhiên.',
    legalBases: [
      'Căn cứ Luật Tiêu chuẩn và Quy chuẩn kỹ thuật ngày 29 tháng 6 năm 2006;',
      'Căn cứ Luật Bảo vệ môi trường ngày 29 tháng 11 năm 2005;',
      'Bộ trưởng Bộ Tài nguyên và Môi trường ban hành Quy chuẩn kỹ thuật quốc gia.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương II: QUY ĐỊNH KỸ THUẬT GIỚI HẠN THÔNG SỐ NƯỚC',
        articles: [
          {
            articleTitle: 'Điều 2. Giới hạn các thông số nước nuôi thủy sản',
            content: [
              '1. Nồng độ Oxy hòa tan (DO): Tối thiểu ≥ 3.5 mg/L đối với vùng nuôi nước ngọt và ≥ 4.0 mg/L đối với vùng nuôi tôm nước lợ/mặn.',
              '2. Độ pH: Dao động trong khoảng từ 6.5 đến 8.5.',
              '3. Nồng độ Amoni (NH4+): Giới hạn tối đa không vượt quá 0.9 mg/L.',
              '4. Nghiêm cấm tồn tại dầu mỡ khoáng, hóa chất bảo vệ thực vật nhóm Clo hữu cơ trong nguồn nước cấp ao nuôi.',
            ],
          },
        ],
      },
    ],
  },

  'Nghị định 80/2012/NĐ-CP': {
    id: 'ND_80_2012',
    code: 'Nghị định 80/2012/NĐ-CP',
    title: 'NGHỊ ĐỊNH VỀ QUẢN LÝ CẢNG CÁ VÀ KHU NEO ĐẬU TRÁNH TRÚ BÃO CHO TÀU CÁ',
    issuingAuthority: 'CHÍNH PHỦ NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '08/10/2012',
    effectiveDate: '01/12/2012',
    signerTitle: 'THỦ TƯỚNG CHÍNH PHỦ',
    signerName: 'Nguyễn Tấn Dũng',
    summary: 'Quy định việc quy hoạch, đầu tư xây dựng, công bố mở, đóng và quản lý hoạt động khai thác hạ tầng cảng cá, khu neo đậu tránh trú bão cho tàu cá trên phạm vi toàn quốc.',
    legalBases: [
      'Căn cứ Luật Tổ chức Chính phủ ngày 25 tháng 12 năm 2001;',
      'Căn cứ Luật Thủy sản ngày 26 tháng 11 năm 2003;',
      'Chính phủ ban hành Nghị định về quản lý cảng cá và khu neo đậu tránh trú bão.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương III: QUẢN LÝ VÀ KHAI THÁC CẢNG CÁ, KHU NEO ĐẬU',
        articles: [
          {
            articleTitle: 'Điều 12. Trách nhiệm của Ban Quản lý Cảng cá',
            content: [
              '1. Bảo đảm hạ tầng cầu cảng, luồng lạch, phao neo an toàn cho tàu cá ra vào xếp dỡ hải sản.',
              '2. Phối hợp với Kiểm ngư và Biên phòng kiểm tra nhật ký khai thác và vệ sinh an toàn thực phẩm.',
              '3. Tổ chức thu gom rác thải, dầu thải từ tàu cá, không gây ô nhiễm vũng neo đậu.',
            ],
          },
        ],
      },
    ],
  },

  'Quyết định 48/2010/QĐ-TTg': {
    id: 'QD_48_2010',
    code: 'Quyết định 48/2010/QĐ-TTg',
    title: 'QUYẾT ĐỊNH VỀ MỘT SỐ CHÍNH SÁCH HỖ TRỢ NGƯ DÂN SẢN XUẤT TRÊN CÁC VÙNG BIỂN XA',
    issuingAuthority: 'THỦ TƯỚNG CHÍNH PHỦ',
    issueDate: '13/07/2010',
    effectiveDate: '01/09/2010',
    signerTitle: 'THỦ TƯỚNG CHÍNH PHỦ',
    signerName: 'Nguyễn Tấn Dũng',
    summary: 'Chính sách hỗ trợ chi phí nhiên liệu đi biển, chi phí bảo hiểm thuyền viên và thân tàu cá, chi phí mua thiết bị VMS cho ngư dân tham gia khai thác hải sản trên các vùng biển xa Hoàng Sa, Trường Sa.',
    legalBases: [
      'Căn cứ Luật Tổ chức Chính phủ ngày 25 tháng 12 năm 2001;',
      'Xét đề nghị của Bộ trưởng Bộ Nông nghiệp và Phát triển nông thôn và Bộ trưởng Bộ Tài chính;',
      'Thủ tướng Chính phủ ban hành Quyết định hỗ trợ ngư dân sản xuất trên vùng biển xa.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương I: CHÍNH SÁCH HỖ TRỢ NGƯ DÂN KHAI THÁC XA BỜ',
        articles: [
          {
            articleTitle: 'Điều 3. Hỗ trợ chi phí nhiên liệu cho tàu cá xa bờ',
            content: [
              '1. Hỗ trợ chi phí nhiên liệu cho các chuyến biển khai thác hải sản tại các vùng biển xa với mức hỗ trợ từ 25.000.000 đồng đến 100.000.000 đồng/chuyến biển (tối đa 04 chuyến/năm).',
              '2. Điều kiện được hỗ trợ: Tàu cá phải trang bị VMS, bật máy 24/24h và có xác thực tọa độ tại vùng biển xa của lực lượng Hải quân hoặc Biên phòng.',
            ],
          },
        ],
      },
    ],
  },

  'Luật số 42/2013/QH13': {
    id: 'LAW_KN_2013',
    code: 'Luật số 42/2013/QH13',
    title: 'LUẬT TIẾP CÔNG DÂN',
    issuingAuthority: 'QUỐC HỘI NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    issueDate: '25/11/2013',
    effectiveDate: '01/07/2014',
    signerTitle: 'CHỦ TỊCH QUỐC HỘI',
    signerName: 'Nguyễn Sinh Hùng',
    summary: 'Quy định về trách nhiệm tiếp công dân; quản lý công tác tiếp công dân của cơ quan nhà nước và quyền, nghĩa vụ của người đến phản ánh, khiếu nại, tố cáo, kiến nghị.',
    legalBases: [
      'Căn cứ Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam;',
      'Quốc hội ban hành Luật Tiếp công dân.',
    ],
    chapters: [
      {
        chapterTitle: 'Chương II: TRÁCH NHIỆM TIẾP CÔNG DÂN VÀ XỬ LÝ KIẾN NGHỊ',
        articles: [
          {
            articleTitle: 'Điều 14. Trách nhiệm xử lý phản ánh kiến nghị',
            content: [
              '1. Người đứng đầu cơ quan nhà nước có trách nhiệm tiếp nhận, vào sổ theo dõi và phân công đơn vị giải quyết đúng thời hạn quy định.',
              '2. Thông báo bằng văn bản kết quả xử lý phản ánh cho công dân biết và công khai trên cổng thông tin theo quy định pháp luật.',
            ],
          },
        ],
      },
    ],
  },
};
