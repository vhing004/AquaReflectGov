import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/masterDataApi';
import { 
  Building2, 
  MapPin, 
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
  });

  const { data: unitsRes } = useQuery({
    queryKey: ['administrativeUnits'],
    queryFn: () => masterDataApi.getAdministrativeUnits(),
  });

  const departments = deptsRes?.data || [];
  const units = unitsRes?.data || [];

  const petitions = [
    {
      code: '#TS-2026-8891',
      title: 'Kiến nghị nạo vét luồng lạch tại Cửa biển Sa Kỳ đảm bảo an toàn tàu trên 700CV ra vào cập cảng',
      category: 'Hạ tầng cảng cá',
      dept: 'Ban Quản lý Cảng cá',
      slaHours: 120,
      remainingHours: 76,
      priority: 'Khẩn',
      priorityColor: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Đang thẩm tra thực địa',
      statusColor: 'bg-amber-100 text-amber-800',
      submitter: 'Nguyễn Văn Hải (Thuyền trưởng)',
      date: '14/10/2026',
    },
    {
      code: '#TS-2026-4012',
      title: 'Phát hiện cơ sở xả thải nước thải đen ngòm ra kênh Ba Tri lúc 23h đêm',
      category: 'Ô nhiễm nguồn nước',
      dept: 'Chi cục Thủy sản',
      slaHours: 48,
      remainingHours: 18,
      priority: 'Rất khẩn',
      priorityColor: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Đang lấy mẫu xét nghiệm',
      statusColor: 'bg-cyan-100 text-cyan-800',
      submitter: 'Trần Thị Mai (Hộ nuôi tôm)',
      date: '12/09/2026',
    },
    {
      code: '#TS-2026-1198',
      title: 'Dịch bệnh đốm trắng xuất hiện trên diện rộng tại xã Tân Duyệt, tôm chết nổi bọt trắng',
      category: 'Dịch bệnh thủy sản',
      dept: 'Trung tâm Khuyến nông',
      slaHours: 24,
      remainingHours: 8,
      priority: 'Cấp bách',
      priorityColor: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Chờ điều phối chuyên viên',
      statusColor: 'bg-amber-100 text-amber-800',
      submitter: 'Lê Văn Tám (Hợp tác xã)',
      date: '12/09/2026',
    },
    {
      code: '#TS-2026-0923',
      title: 'Tàu giã cào sai tuyến khai thác tận diệt ven bờ vùng biển Sa Huỳnh',
      category: 'Vi phạm IUU',
      dept: 'Thanh tra Thủy sản',
      slaHours: 24,
      remainingHours: 14,
      priority: 'Khẩn',
      priorityColor: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Đã chuyển Biên phòng phối hợp',
      statusColor: 'bg-sky-100 text-sky-800',
      submitter: 'Công dân ẩn danh',
      date: '11/09/2026',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. OFFICER PROFILE BANNER (Theo Stitch Civic Modern) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#003c5c] via-[#006194] to-[#0284c7] text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-extrabold text-cyan-300 backdrop-blur-xs">
            {user?.fullName.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold">{user?.fullName || 'Cán Bộ Tiếp Nhận'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {user?.roleName || 'Điều Phối Viên (Dispatcher)'}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-1">
              Đơn vị quản lý: <strong className="text-white">{user?.departmentName || 'Chi cục Thủy sản & Thanh tra Biển'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-right text-xs">
            <span className="text-sky-200 block text-[10px] uppercase font-bold">Quyền hạn hệ thống</span>
            <span className="font-extrabold text-emerald-300 flex items-center space-x-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Được phép Điều Phối & Phân Công SLA</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chờ Tiếp Nhận Mới</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#006194] mt-1">14</p>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">4 hồ sơ cần xử lý trong 2 giờ</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đang Thẩm Tra Thực Địa</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">8</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Đội kiểm ngư & trắc đạc đang xử lý</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đã Ban Hành Quyết Định</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">128</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Đạt 96.8% đúng hạn cam kết</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cảnh Báo Quá Hạn SLA</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">0</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">0% hồ sơ trễ hạn tuần này</p>
        </div>
      </div>

      {/* 3. DANH SÁCH HỒ SƠ PHẢN ÁNH CẦN ĐIỀU PHỐI (Bản Desktop Stitch Screen 321b98e6b8734a1c946bc4b9559608fb) */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
              Danh sách tiếp nhận & luân chuyển hồ sơ
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Hồ Sơ Phản Ánh Cần Xử Lý & Theo Dõi SLA
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Lọc theo phòng ban:</span>
            <select className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50">
              <option>Tất cả phòng ban ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng hồ sơ */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Tiêu đề phản ánh</th>
                <th className="py-3 px-4">Chuyên mục</th>
                <th className="py-3 px-4">Đơn vị thụ lý</th>
                <th className="py-3 px-4">Đồng hồ SLA</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {petitions.map((p) => (
                <tr key={p.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#006194] whitespace-nowrap">
                    {p.code}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-bold text-slate-900 leading-snug line-clamp-2">{p.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Người gửi: {p.submitter} • {p.date}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {p.dept}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-slate-900">Còn {p.remainingHours}h / {p.slaHours}h</span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(p.remainingHours / p.slaHours) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.statusColor}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Xem chi tiết & Phân công hồ sơ ${p.code}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-[11px] transition-colors"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. PHÒNG BAN CHUYÊN MÔN & ĐỊA BÀN QUẢN LÝ (Kết nối API Backend Thật) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Các phòng ban thụ lý */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>Phòng Ban Chuyên Môn Thụ Lý ({departments.length})</span>
            </span>
          </div>

          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{dept.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dept.description}</p>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                  {dept.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Các đơn vị hành chính ven biển */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4" />
              <span>Địa Bàn Giám Sát Ven Biển ({units.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">{unit.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">#{unit.code}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
