import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Clock, 
  FileCheck2, 
  Briefcase, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  Loader2, 
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useAuthStore } from '../../store/useAuthStore';
import { AssignMemberModal } from '../../components/admin/AssignMemberModal';
import { InspectionReportModal } from '../../components/admin/InspectionReportModal';
import type { 
  AdminPetitionItem, 
  DepartmentOfficer, 
  AdminPetitionDetail 
} from '../../types';

export const UnitDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const departmentId = user?.departmentId;
  const departmentName = user?.departmentName || 'Đơn vị Chuyên môn';

  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [petitions, setPetitions] = useState<AdminPetitionItem[]>([]);
  const [filterTab, setFilterTab] = useState<'unassigned' | 'pendingApproval' | 'investigating' | 'all'>('unassigned');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    petitionId: string;
    trackingCode: string;
    currentAssignedUserId?: string;
  }>({
    isOpen: false,
    petitionId: '',
    trackingCode: '',
  });

  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    petition: AdminPetitionDetail | null;
  }>({
    isOpen: false,
    petition: null,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (departmentId) {
      loadDashboardData();
    }
  }, [departmentId]);

  const loadDashboardData = async () => {
    if (!departmentId) return;
    setIsLoading(true);
    try {
      const [officersRes, petitionsRes] = await Promise.all([
        adminApi.getDepartmentOfficers(departmentId),
        adminApi.getPetitions({
          departmentId: departmentId,
          pageSize: 100,
        }),
      ]);

      if (officersRes.success && officersRes.data) {
        setOfficers(officersRes.data);
      }
      if (petitionsRes.success && petitionsRes.data) {
        setPetitions(petitionsRes.data.items);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu bảng điều phối đơn vị:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAssignModal = (petition: AdminPetitionItem) => {
    setAssignModalData({
      isOpen: true,
      petitionId: petition.id,
      trackingCode: petition.trackingCode,
    });
  };

  const handleOpenReviewModal = async (petitionId: string) => {
    try {
      const res = await adminApi.getPetitionDetail(petitionId);
      if (res.success && res.data) {
        setReviewModalData({
          isOpen: true,
          petition: res.data,
        });
      }
    } catch {
      showToast('Không thể tải chi tiết hồ sơ để thẩm định.');
    }
  };

  // Tính toán số liệu thống kê
  const unassignedCount = petitions.filter(p => p.status === 2 && !p.assignedUserName).length;
  const pendingApprovalCount = petitions.filter(p => p.status === 11).length;
  const investigatingCount = petitions.filter(p => p.status === 3).length;
  const resolvedCount = petitions.filter(p => p.status === 4 || p.status === 6).length;

  // Lọc danh sách hồ sơ
  const filteredPetitions = petitions.filter(p => {
    // Lọc theo tab
    if (filterTab === 'unassigned' && (p.status !== 2 || p.assignedUserName)) return false;
    if (filterTab === 'pendingApproval' && p.status !== 11) return false;
    if (filterTab === 'investigating' && p.status !== 3) return false;

    // Lọc theo từ khóa tìm kiếm
    if (searchKeyword.trim()) {
      const term = searchKeyword.toLowerCase();
      const matchCode = p.trackingCode.toLowerCase().includes(term);
      const matchTitle = p.title.toLowerCase().includes(term);
      const matchAssignee = p.assignedUserName?.toLowerCase().includes(term);
      if (!matchCode && !matchTitle && !matchAssignee) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium">
              <Users className="w-3.5 h-3.5" /> Bảng Điều Phối Đơn Vị Nghiệp Vụ
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {departmentName}
            </h1>
            <p className="text-blue-100/80 text-sm max-w-2xl leading-relaxed">
              Trưởng đơn vị quản lý phân bổ hồ sơ cho các thành viên, giám sát tiến độ thẩm tra thực địa và phê duyệt báo cáo nghiệm thu trước khi ban hành kết luận chính thức.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Đơn cần phân công */}
        <div 
          onClick={() => setFilterTab('unassigned')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'unassigned'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Chờ phân công</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-800">{unassignedCount}</span>
            <p className="text-xs text-slate-500 mt-1">Đơn chưa cử cán bộ</p>
          </div>
        </div>

        {/* Chờ duyệt nghiệm thu */}
        <div 
          onClick={() => setFilterTab('pendingApproval')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'pendingApproval'
              ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Chờ duyệt nghiệm thu</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-800">{pendingApprovalCount}</span>
            <p className="text-xs text-slate-500 mt-1">Cán bộ đã nộp báo cáo</p>
          </div>
        </div>

        {/* Đang xác minh */}
        <div 
          onClick={() => setFilterTab('investigating')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'investigating'
              ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Đang xác minh</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-800">{investigatingCount}</span>
            <p className="text-xs text-slate-500 mt-1">Khảo sát hiện trường</p>
          </div>
        </div>

        {/* Đã hoàn thành */}
        <div 
          onClick={() => setFilterTab('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Đã giải quyết</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-800">{resolvedCount}</span>
            <p className="text-xs text-slate-500 mt-1">Đã có kết luận</p>
          </div>
        </div>
      </div>

      {/* Đội ngũ thành viên & Workload Tải công việc */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Đội Ngũ Thành Viên Đơn Vị ({officers.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Giám sát tải công việc để phân bổ đồng đều</span>
        </div>

        {officers.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">Chưa có thành viên nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {officers.map((officer) => (
              <div 
                key={officer.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                    {officer.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-800">{officer.fullName}</span>
                      {officer.isUnitLead && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          Trưởng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">@{officer.username}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    officer.workloadLevel === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : officer.workloadLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    <Briefcase className="w-3 h-3" />
                    {officer.activeCaseCount} hồ sơ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách hồ sơ cần xử lý */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab('unassigned')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'unassigned'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chờ phân công ({unassignedCount})
            </button>
            <button
              onClick={() => setFilterTab('pendingApproval')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'pendingApproval'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chờ duyệt nghiệm thu ({pendingApprovalCount})
            </button>
            <button
              onClick={() => setFilterTab('investigating')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'investigating'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Đang xác minh ({investigatingCount})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({petitions.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, tiêu đề..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-60 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm">Đang tải hồ sơ đơn vị...</span>
            </div>
          ) : filteredPetitions.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">Không tìm thấy hồ sơ nào phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Mã hồ sơ</th>
                  <th className="px-5 py-3.5">Tiêu đề phản ánh</th>
                  <th className="px-5 py-3.5">Lĩnh vực</th>
                  <th className="px-5 py-3.5">Cán bộ phụ trách</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPetitions.map((petition) => {
                  const isUnassigned = petition.status === 2 && !petition.assignedUserName;
                  const isPendingApproval = petition.status === 11;

                  return (
                    <tr key={petition.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-blue-700 whitespace-nowrap">
                        <Link to={`/admin/petitions/${petition.id}`} className="hover:underline">
                          {petition.trackingCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800 max-w-xs truncate">
                        {petition.title}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {petition.categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {petition.assignedUserName ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                              {petition.assignedUserName.slice(0, 1)}
                            </span>
                            {petition.assignedUserName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Chưa phân công
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPendingApproval
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                            : isUnassigned
                            ? 'bg-amber-100 text-amber-800'
                            : petition.status === 3
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {petition.statusName}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnassigned && (
                            <button
                              onClick={() => handleOpenAssignModal(petition)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Phân công</span>
                            </button>
                          )}

                          {isPendingApproval && (
                            <button
                              onClick={() => handleOpenReviewModal(petition.id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Duyệt nghiệm thu</span>
                            </button>
                          )}

                          <Link
                            to={`/admin/petitions/${petition.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Member Modal */}
      {assignModalData.isOpen && (
        <AssignMemberModal
          isOpen={assignModalData.isOpen}
          onClose={() => setAssignModalData(prev => ({ ...prev, isOpen: false }))}
          petitionId={assignModalData.petitionId}
          trackingCode={assignModalData.trackingCode}
          departmentId={departmentId}
          departmentName={departmentName}
          currentAssignedUserId={assignModalData.currentAssignedUserId}
          onSuccess={(assignedName) => {
            showToast(`Đã phân công hồ sơ ${assignModalData.trackingCode} cho cán bộ ${assignedName}.`);
            loadDashboardData();
          }}
        />
      )}

      {/* Review Modal */}
      {reviewModalData.isOpen && reviewModalData.petition && (
        <InspectionReportModal
          isOpen={reviewModalData.isOpen}
          onClose={() => setReviewModalData({ isOpen: false, petition: null })}
          petition={reviewModalData.petition}
          mode="review"
          onSuccess={(msg) => {
            showToast(msg);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};
