import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/masterDataApi';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { LEGAL_DOCUMENTS } from '../data/legalDocumentsData';
import {
  Fish,
  Droplets,
  AlertOctagon,
  Anchor,
  MapPin,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Send,
  BookOpen,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  PhoneCall,
  Scale,
  ExternalLink,
} from 'lucide-react';

// Map ảnh banner chất lượng cao cho từng chuyên ngành
const CATEGORY_IMAGES: Record<string, string> = {
  O_NHIEM_NUOC: '/images/categories/water_pollution.jpg',
  DICH_BENH: '/images/categories/aquatic_disease.jpg',
  VI_PHAM_IUU: '/images/categories/iuu_fishing.jpg',
  GIONG_THUC_AN: '/images/categories/seed_feed.jpg',
  HA_TANG_CANG_CA: '/images/categories/port_infrastructure.jpg',
  THU_TUC_HANH_CHINH: '/images/categories/admin_procedure.jpg',
  KHAC: '/images/categories/other_fishery.jpg',
};

// Dữ liệu chi tiết quy trình, văn bản pháp lý và đơn vị thụ lý cho từng chuyên ngành
interface CategoryDetailInfo {
  overview: string;
  scope: string[];
  regulations: { title: string; code: string; desc: string }[];
  processSteps: { step: string; title: string; desc: string }[];
  department: string;
  hotline: string;
}

const CATEGORY_DETAILS: Record<string, CategoryDetailInfo> = {
  O_NHIEM_NUOC: {
    overview:
      'Chuyên ngành Tiếp nhận & Xử lý các sự cố môi trường nước trong nuôi trồng thủy sản và vùng biển ven bờ Quảng Ngãi. Hệ thống tiếp nhận phản ánh về nguồn nước thải công nghiệp, rác thải ven ao nuôi, xả bẩn làm sụt giảm nồng độ Oxy hòa tan (DO) hoặc ô nhiễm hóa chất ảnh hưởng tới đầm nuôi tôm cá.',
    scope: [
      'Xả thải nước công nghiệp hoặc rác thải chưa qua xử lý xuống đầm nuôi tôm cá, kênh cấp nước.',
      'Sự cố tràn dầu, ô nhiễm chất thải nguy hại ven bờ biển, cảng cá.',
      'Nguồn nước bị xâm nhập mặn đột biến, nhiễm mặn hoặc suy giảm chất lượng nước sinh thái.',
      'Hiện tượng xả thải gây chết thủy sản hàng loạt trên diện rộng.',
    ],
    regulations: [
      {
        title: 'Luật Bảo vệ Môi trường 2020',
        code: 'Luật số 72/2020/QH14',
        desc: 'Quy định trách nhiệm kiểm soát ô nhiễm nước tại các vùng nuôi trồng thủy sản tập trung.',
      },
      {
        title: 'Luật Thủy sản 2017',
        code: 'Luật số 18/2017/QH14',
        desc: 'Điều 34 quy định điều kiện môi trường vùng nuôi trồng thủy sản và quan trắc cảnh báo môi trường.',
      },
      {
        title: 'Quy chuẩn Kỹ thuật Quốc gia về Nước Thủy sản',
        code: 'QCVN 38:2011/BTNMT',
        desc: 'Quy định giới hạn các thông số chất lượng nước vùng nuôi trồng thủy sản.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Tiếp nhận & Xác minh tọa độ', desc: 'Hệ thống tự động phân loại, kiểm tra hình ảnh hiện trường và định vị vùng nước ô nhiễm trên bản đồ GIS.' },
      { step: '02', title: 'Khảo sát & Lấy mẫu quan trắc', desc: 'Cán bộ Chi cục Thủy sản phối hợp cùng Phòng TN&MT trực tiếp xuống hiện trường lấy mẫu kiểm tra thông số DO, pH, BOD5.' },
      { step: '03', title: 'Ban hành kết luận & Xử lý', desc: 'Ra văn bản thông báo kết quả kiểm nghiệm, khoanh vùng khắc phục và xử lý vi phạm hành chính đối với cơ sở vi phạm.' },
      { step: '04', title: 'Công khai kết quả & Khảo sát CSAT', desc: 'Cập nhật kết quả thụ lý chính thức lên cổng thông tin công khai và gửi thông báo kết quả đến người dân.' },
    ],
    department: 'Chi cục Thủy sản Quảng Ngãi phối hợp cùng Phòng Tài nguyên & Môi trường các Huyện/Thành phố',
    hotline: '0255.3822.456 (Đường dây nóng Môi trường Thủy sản)',
  },

  DICH_BENH: {
    overview:
      'Chuyên ngành Giám sát, Cảnh báo & Khống chế dịch bệnh nguy hiểm trên tôm, cá nuôi (như bệnh đốm trắng WSSV, hoại tử gan tụy cấp AHPND, mờ đục cơ, vi bào tử trùng EHP). Hỗ trợ tư vấn phác đồ xử lý và tiêu độc khử trùng vùng nuôi.',
    scope: [
      'Báo cáo hiện tượng tôm cá nuôi tấp bờ, bỏ ăn, chết rải rác hoặc chết hàng loạt.',
      'Nghi ngờ xuất hiện các chủng vi-rút, vi khuẩn mới gây ô nhiễm chéo giữa các vùng nuôi.',
      'Cần hỗ trợ hóa chất Benkocid, Chlorine khử trùng ổ dịch từ nguồn dự trữ quốc gia.',
      'Tư vấn kỹ thuật xét nghiệm PCR chẩn đoán sớm mầm bệnh cho ngư dân.',
    ],
    regulations: [
      {
        title: 'Thông tư Quy định Phòng chống Dịch bệnh Thủy sản',
        code: 'Thông tư 04/2016/TT-BNNPTNT',
        desc: 'Danh mục bệnh thủy sản phải công bố dịch và quy trình phòng chống dịch bệnh động vật thủy sản.',
      },
      {
        title: 'Luật Thú y 2015',
        code: 'Luật số 79/2015/QH13',
        desc: 'Quy định công tác phòng bệnh, kiểm dịch, kiểm soát giết mổ và ứng phó sự cố dịch bệnh.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Ghi nhận báo cáo dịch', desc: 'Phòng chuyên môn tiếp nhận phản ánh kèm hình ảnh tôm cá bị bệnh và diện tích vùng nuôi bị ảnh hưởng.' },
      { step: '02', title: 'Chẩn đoán PCR & Khoanh vùng', desc: 'Thú y viên thu mẫu bệnh phẩm gửi phòng Lab xét nghiệm PCR khẩn cấp trong vòng 12-24h.' },
      { step: '03', title: 'Cấp hóa chất & Hướng dẫn tiêu độc', desc: 'Cấp phát hóa chất dập dịch, hướng dẫn hộ nuôi xử lý nước thải trước khi xả ra môi trường.' },
      { step: '04', title: 'Khống chế dịch & Công bố kết quả', desc: 'Cập nhật bản đồ cảnh báo dịch bệnh khu vực và hoàn tất báo cáo thụ lý gửi người dân.' },
    ],
    department: 'Trạm Thú y Thủy sản & Trung tâm Khuyến nông Tỉnh Quảng Ngãi',
    hotline: '0255.3811.789 (Đường dây nóng Cảnh báo Dịch bệnh Thủy sản)',
  },

  VI_PHAM_IUU: {
    overview:
      'Chuyên ngành Giám sát, Phòng chống Khai thác Hải sản Trái phép, Không báo cáo và Không theo quy định (IUU). Tiếp nhận tin báo về tàu cá mất kết nối VMS, vượt ranh giới vùng biển quốc tế, sử dụng xung điện, chất nổ hoặc lưới cào tận diệt.',
    scope: [
      'Phát hiện tàu cá tháo thiết bị giám sát hành trình (VMS) hoặc cố tình làm gián đoạn tín hiệu truyền dữ liệu.',
      'Tin báo tàu cá có dấu hiệu vi phạm vùng biển nước ngoài hoặc khai thác sai vùng/sai tuyến.',
      'Sử dụng kích điện, chất nổ, chất độc hoặc bẫy lồng tận diệt nguồn lợi thủy sản ven bờ.',
      'Gian lận nhật ký khai thác, mua bán hải sản không rõ nguồn gốc xuất xứ tại cảng.',
    ],
    regulations: [
      {
        title: 'Nghị định Xử phạt Hành chính trong Lĩnh vực Thủy sản',
        code: 'Nghị định 42/2019/NĐ-CP',
        desc: 'Mức phạt tiền lên đến 1 tỷ đồng và tước giấy phép khai thác đối với các hành vi vi phạm nghiêm trọng IUU.',
      },
      {
        title: 'Quyết định của Thủ tướng Chính phủ về Cảnh báo thẻ vàng EC',
        code: 'Quyết định 81/QĐ-TTg',
        desc: 'Kế hoạch hành động chống khai thác hải sảnผิด pháp luật IUU gỡ cảnh báo Thẻ vàng.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Xác minh tọa độ VMS & Vùng biển', desc: 'Truy xuất dữ liệu hệ thống Giám sát Tàu cá VMS kết hợp định vị vệ tinh GPS để xác minh vị trí tàu.' },
      { step: '02', title: 'Điều động Lực lượng Kiểm ngư', desc: 'Chuyển thông tin khẩn cấp đến Tàu Kiểm ngư hoặc Đồn Biên phòng tuyến biển gần nhất để chặn dừng kiểm tra.' },
      { step: '03', title: 'Xử lý vi phạm & Tước giấy phép', desc: 'Lập biên bản vi phạm hành chính, tịch thu tang vật vi phạm và cập nhật vào Cơ sở dữ liệu VNFishbase.' },
      { step: '04', title: 'Công khai kết quả thụ lý', desc: 'Thông báo văn bản xử lý cho người phản ánh và cập nhật trạng thái hồ sơ công khai.' },
    ],
    department: 'Chi cục Thủy sản (Bộ phận Kiểm ngư) phối hợp cùng Bộ Chỉ huy Bộ đội Biên phòng Tỉnh',
    hotline: '0255.3845.678 (Đường dây nóng Chống Khai thác IUU 24/7)',
  },

  GIONG_THUC_AN: {
    overview:
      'Chuyên ngành Quản lý Chất lượng Tôm/Cá giống, Thức ăn chăn nuôi thủy sản, Sản phẩm xử lý môi trường nuôi trồng và Vật tư đầu vào. Tiếp nhận phản ánh về con giống trôi nổi, kém chất lượng, thức ăn giả hoặc chứa kháng sinh cấm.',
    scope: [
      'Phát hiện cơ sở kinh doanh tôm giống, cá giống không có giấy chứng nhận kiểm dịch.',
      'Thức ăn thủy sản bị mốc, kém chất lượng, sai tỷ lệ độ đạm so với nhãn mác công bố.',
      'Sản phẩm cải tạo môi trường nuôi (men vi sinh, hóa chất) chứa chất cấm thuộc danh mục hạn chế.',
      'Cơ sở sản xuất giống thủy sản không đủ điều kiện an toàn sinh học.',
    ],
    regulations: [
      {
        title: 'Nghị định Quản lý Giống & Thức ăn Thủy sản',
        code: 'Nghị định 26/2019/NĐ-CP',
        desc: 'Quy định điều kiện cơ sở sản xuất, ươm dưỡng giống thủy sản và quản lý thức ăn, sản phẩm xử lý môi trường.',
      },
      {
        title: 'Danh mục Hóa chất, Kháng sinh Cấm trong Thủy sản',
        code: 'Thông tư 10/2016/TT-BNNPTNT',
        desc: 'Quy định các chất cấm sử dụng trong sản xuất, kinh doanh thủy sản.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Tiếp nhận thông tin lô hàng', desc: 'Ghi nhận tên cơ sở cung ứng, mã lô giống/thức ăn và hóa đơn mua bán từ người phản ánh.' },
      { step: '02', title: 'Thanh tra đột xuất & Niêm phong mẫu', desc: 'Đoàn thanh tra chuyên ngành tiến hành kiểm tra thực địa, lấy mẫu thử nghiệm chỉ tiêu chất lượng.' },
      { step: '03', title: 'Xử lý vi phạm & Thu hồi sản phẩm', desc: 'Buộc tiêu hủy lô giống nhiễm bệnh hoặc thu hồi sản phẩm thức ăn không đạt tiêu chuẩn.' },
      { step: '04', title: 'Báo cáo thụ lý', desc: 'Công khai danh tính cơ sở vi phạm trên cổng thông tin để ngư dân chủ động phòng tránh.' },
    ],
    department: 'Phòng Quản lý Giống & Vật tư Thủy sản - Chi cục Thủy sản Quảng Ngãi',
    hotline: '0255.3833.112 (Đường dây nóng Quản lý Vật tư Thủy sản)',
  },

  HA_TANG_CANG_CA: {
    overview:
      'Chuyên ngành Giám sát & Quản lý Hạ tầng Cảng cá (như Cảng cá Sa Kỳ, Cảng cá Tịnh Hòa, Cảng cá Mỹ Á, Sông Đốc), Luồng lạch bồi lấp, Bến cá, Khu neo đậu tránh trú bão và Hệ thống điện nước dịch vụ nghề cá.',
    scope: [
      'Luồng lạch cửa biển bị bồi lấp cát gây mắc cạn, hư hỏng chân vịt tàu cá khi ra vào.',
      'Hạ tầng cầu cảng, bờ kè bị nứt gãy, sạt lở nguy hiểm cho tàu thuyền neo buộc.',
      'Hệ thống cung cấp điện, nước ngọt, đá lạnh tại cảng cá bị gián đoạn hoặc thu phí sai quy định.',
      'Tình trạng vứt rác thải, dầu thải bẩn trực tiếp xuống lòng vũng neo đậu tàu cá.',
    ],
    regulations: [
      {
        title: 'Quy định Quản lý Cảng cá & Khu Neo đậu Tránh trú bão',
        code: 'Nghị định 80/2012/NĐ-CP',
        desc: 'Quy định về quản lý, vận hành và khai thác hạ tầng bến cảng khu neo đậu tàu cá.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Khảo sát hiện trạng hạ tầng', desc: 'Cán bộ Ban Quản lý Cảng cá cử đội kỹ thuật đo đạc độ sâu luồng lạch hoặc kiểm tra hư hỏng cầu cảng.' },
      { step: '02', title: 'Lập phương án sửa chữa khẩn cấp', desc: 'Phối hợp với Sở Giao thông Vận tải / Ban QLDA nạo vét luồng lạch hoặc gia cố kè bến.' },
      { step: '03', title: 'Khắc phục sự cố & Nghiệm thu', desc: 'Tiến hành thi công khắc phục sự cố đảm bảo an toàn cho tàu thuyền ra vào cập cảng.' },
      { step: '04', title: 'Thông báo kết quả xử lý', desc: 'Cập nhật trạng thái an toàn luồng lạch cho bà con ngư dân nắm bắt.' },
    ],
    department: 'Ban Quản lý Cảng cá Quảng Ngãi & Đoạn Quản lý Đường thủy nội địa',
    hotline: '0255.3855.999 (Đường dây nóng Hạ tầng Cảng cá & Neo đậu)',
  },

  THU_TUC_HANH_CHINH: {
    overview:
      'Chuyên ngành Hướng dẫn, Giải đáp & Tiếp nhận phản ánh về Thủ tục Hành chính Thủy sản: Đăng ký, đăng kiểm tàu cá, Cấp Giấy phép khai thác thủy sản, Chứng nhận An toàn thực phẩm tàu cá, Cấp mã số vùng nuôi và Chính sách hỗ trợ nhiên liệu chuyến biển.',
    scope: [
      'Phản ánh về thái độ hách dịch, chậm trễ hồ sơ đăng kiểm tàu cá tại Trung tâm Đăng kiểm.',
      'Vướng mắc thủ tục cấp đổi Giấy phép khai thác hải sản, giấy chứng nhận an toàn kỹ thuật.',
      'Chậm chi trả tiền hỗ trợ nhiên liệu theo Quyết định 48/2010/QĐ-TTg cho ngư dân xa bờ.',
      'Tư vấn hướng dẫn thủ tục đăng ký mã số vùng nuôi tôm cá phục vụ truy xuất nguồn gốc.',
    ],
    regulations: [
      {
        title: 'Nghị định Quy định chi tiết Luật Thủy sản',
        code: 'Nghị định 26/2019/NĐ-CP',
        desc: 'Quy định trình tự, thủ tục đăng ký, đăng kiểm và cấp giấy phép khai thác tàu cá.',
      },
      {
        title: 'Quyết định Hỗ trợ Ngư dân Khai thác Hải sản Xa bờ',
        code: 'Quyết định 48/2010/QĐ-TTg',
        desc: 'Một số chính sách hỗ trợ ngư dân sản xuất trên các vùng biển xa.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Tiếp nhận hồ sơ vướng mắc', desc: 'Bộ phận Một cửa rà soát mã hồ sơ tra cứu và làm rõ nguyên nhân chậm trễ.' },
      { step: '02', title: 'Đôn đốc đơn vị giải quyết', desc: 'Gửi phiếu yêu cầu giải trình đến Trung tâm Đăng kiểm hoặc Phòng Kế toán ngân sách.' },
      { step: '03', title: 'Hoàn thiện thủ tục & Trả kết quả', desc: 'Đẩy nhanh tiến độ trả Giấy đăng kiểm / Giấy phép hoặc giải ngân kinh phí hỗ trợ.' },
      { step: '04', title: 'Xin ý kiến CSAT công dân', desc: 'Gửi thư xin lỗi nếu chậm trễ và ghi nhận đánh giá hài lòng của ngư dân.' },
    ],
    department: 'Bộ phận 1 Cửa Chi cục Thủy sản Quảng Ngãi & Trung tâm Đăng kiểm Tàu cá',
    hotline: '0255.3899.222 (Đường dây nóng Hỗ trợ Thủ tục Hành chính Thủy sản)',
  },

  KHAC: {
    overview:
      'Chuyên ngành Tiếp nhận các vấn đề phát sinh khác liên quan đến hoạt động nghề cá, đề xuất sáng kiến nuôi trồng thủy sản, hỏi đáp chính sách mới hoặc hỗ trợ cứu hộ sự cố trên biển.',
    scope: [
      'Đề xuất sáng kiến cải tiến công nghệ nuôi tôm cá công nghệ cao.',
      'Hỏi đáp về các chính sách vay vốn ưu đãi đóng mới, nâng cấp tàu cá.',
      'Các kiến nghị thủy sản chưa thuộc 6 danh mục chuyên ngành nêu trên.',
    ],
    regulations: [
      {
        title: 'Luật Tiếp công dân & Giải quyết Kiến nghị',
        code: 'Luật số 42/2013/QH13',
        desc: 'Quy định trách nhiệm tiếp nhận, xử lý phản ánh kiến nghị của công dân.',
      },
    ],
    processSteps: [
      { step: '01', title: 'Phân loại kiến nghị', desc: 'Văn phòng Sở Nông nghiệp & PTNT đọc nội dung và phân công đơn vị thụ lý phù hợp.' },
      { step: '02', title: 'Nghiên cứu & Trả lời', desc: 'Cán bộ chuyên môn soạn thảo văn bản trả lời chính thức hoặc chuyển cơ quan liên quan.' },
      { step: '03', title: 'Công khai câu trả lời', desc: 'Đăng tải văn bản giải đáp lên cổng thông tin để bà con cùng tham khảo.' },
    ],
    department: 'Văn phòng Sở Nông nghiệp & Phát triển Nông thôn Tỉnh Quảng Ngãi',
    hotline: '0255.3822.111 (Tổng đài Tiếp nhận Phản ánh Thủy sản)',
  },
};

export const CategoryDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // State: Modal xem văn bản quy phạm pháp luật
  const [selectedDocCode, setSelectedDocCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDocument = (docCode: string) => {
    setSelectedDocCode(docCode);
    setIsModalOpen(true);
  };

  // Fetch thông tin danh mục từ API
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: () => masterDataApi.getCategories(),
  });

  const categories = categoriesRes?.data || [];
  const currentCategory = categories.find((c) => c.code === code) || {
    id: 'unknown',
    code: code || 'KHAC',
    name: 'Chuyên Ngành Thủy Sản',
    description: 'Chi tiết thông tin tiếp nhận và xử lý kiến nghị chuyên ngành.',
    defaultSlaHours: 48,
  };

  const detailInfo = CATEGORY_DETAILS[currentCategory.code] || CATEGORY_DETAILS['KHAC'];
  const bannerImage = CATEGORY_IMAGES[currentCategory.code] || CATEGORY_IMAGES['KHAC'];

  const getCategoryIcon = (catCode: string) => {
    switch (catCode) {
      case 'O_NHIEM_NUOC':
        return <Droplets className="w-7 h-7 text-cyan-500" />;
      case 'DICH_BENH':
        return <AlertOctagon className="w-7 h-7 text-rose-500" />;
      case 'VI_PHAM_IUU':
        return <Anchor className="w-7 h-7 text-sky-400" />;
      case 'GIONG_THUC_AN':
        return <Fish className="w-7 h-7 text-emerald-400" />;
      case 'HA_TANG_CANG_CA':
        return <MapPin className="w-7 h-7 text-amber-400" />;
      case 'THU_TUC_HANH_CHINH':
        return <FileText className="w-7 h-7 text-purple-400" />;
      default:
        return <Fish className="w-7 h-7 text-slate-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 1. HERO BANNER HEADER */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={bannerImage}
            alt={currentCategory.name}
            className="w-full h-full object-cover blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Danh Mục Thủy Sản</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  {getCategoryIcon(currentCategory.code)}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono">
                  Mã số: #{currentCategory.code}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cam kết SLA: {currentCategory.defaultSlaHours}h</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {currentCategory.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed drop-shadow-xs">
                {currentCategory.description}
              </p>
            </div>

            {/* Cụm Nút Hành Động */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to={`/submit?category=${currentCategory.code}`}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-sm shadow-lg shadow-sky-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Phản Ánh Ngay</span>
              </Link>

              <Link
                to={`/track?category=${currentCategory.code}`}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                <FileCheck2 className="w-4 h-4 text-cyan-300" />
                <span>Tra Cứu Hồ Sơ Đã Xử Lý</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHI TIẾT NỘI DUNG CHUYÊN NGÀNH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái (Main Contents - 2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tổng quan & Phạm vi tiếp nhận */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#006194] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Tổng Quan & Phạm Vi Tiếp Nhận Phản Ánh
                </h2>
                <p className="text-xs text-slate-500">
                  Chức năng nhiệm vụ quản lý nhà nước của chuyên ngành
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {detailInfo.overview}
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Các trường hợp cụ thể tiếp nhận phản ánh:
              </h3>
              <ul className="space-y-2.5">
                {detailInfo.scope.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quy trình 4 Bước Giải Quyết Thụ Lý */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Quy Trình 4 Bước Thụ Lý & Giải Quyết Công Khai
                </h2>
                <p className="text-xs text-slate-500">
                  Cam kết minh bạch và tuân thủ đúng thời gian quy định SLA {currentCategory.defaultSlaHours}h
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailInfo.processSteps.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-sky-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#006194] text-white">
                      Bước {s.step}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Quy trình chuẩn</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 pt-1">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Căn Cứ Văn Bản Pháp Luật & Quy Định */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Căn Cứ Văn Bản Quy Phạm Pháp Luật
                </h2>
                <p className="text-xs text-slate-500">
                  Khung pháp lý áp dụng trong quá trình kiểm tra, thẩm định và xử lý
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {detailInfo.regulations.map((reg, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenDocument(reg.code)}
                  className="group p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-400 hover:bg-sky-50/50 shadow-2xs transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#006194] transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#006194] shrink-0" />
                      <span>{reg.title}</span>
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#006194] px-2.5 py-1 rounded-lg bg-sky-100 group-hover:bg-[#006194] group-hover:text-white transition-colors shrink-0">
                      {reg.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-6">{reg.desc}</p>

                  <div className="pt-2 flex items-center justify-end border-t border-slate-200/50">
                    <span className="text-[11px] font-bold text-[#006194] group-hover:underline inline-flex items-center gap-1">
                      <span>Xem toàn văn bản quy định</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Phải (Sidebar Contact & Stats - 1 Col) */}
        <div className="space-y-6">
          {/* Đơn Vị Phụ Trách Thụ Lý */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 text-[#006194]">
              <Building2 className="w-5 h-5" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Đơn Vị Thụ Lý Chính</h3>
            </div>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {detailInfo.department}
            </p>
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Đường dây nóng hỗ trợ khẩn cấp:
              </span>
              <p className="text-xs font-extrabold text-[#006194] flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>{detailInfo.hotline}</span>
              </p>
            </div>
          </div>

          {/* Cam Kết Chất Lượng Phục Vụ */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#006194] to-sky-900 text-white shadow-md space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
              <span>Cam Kết Chất Lượng Dịch Vụ</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-sky-100">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-cyan-300">•</span>
                <span>Tiếp nhận phản ánh 24/7 và định vị tọa độ chính xác.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-cyan-300">•</span>
                <span>Tuyệt đối bảo mật thông tin định danh của người phản ánh.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-cyan-300">•</span>
                <span>Xử lý đúng hạn SLA {currentCategory.defaultSlaHours}h làm việc.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-cyan-300">•</span>
                <span>Công khai kết quả thụ lý chính thức và thu nhận đánh giá CSAT.</span>
              </li>
            </ul>

            <Link
              to={`/submit?category=${currentCategory.code}`}
              className="mt-2 w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-white text-[#006194] hover:bg-sky-50 font-extrabold text-xs transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-[#006194]" />
              <span>Gửi Đơn Phản Ánh Ngay</span>
            </Link>
          </div>

          {/* Các Chuyên Ngành Khác */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Các Chuyên Ngành Liên Quan
            </h3>
            <div className="space-y-2">
              {categories
                .filter((c) => c.code !== currentCategory.code)
                .slice(0, 5)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.code}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">SLA {cat.defaultSlaHours}h</span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XEM TOÀN VĂN BẢN QUY PHẠM PHÁP LUẬT */}
      <LegalDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocCode ? LEGAL_DOCUMENTS[selectedDocCode] || null : null}
      />
    </div>
  );
};

export default CategoryDetailPage;
