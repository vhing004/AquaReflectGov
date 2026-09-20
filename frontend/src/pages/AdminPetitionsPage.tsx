import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { adminApi } from '../api/adminApi';
import { masterDataApi } from '../api/masterDataApi';
import type { AdminPetitionFilterParams, AdminPetitionItem } from '../types';
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
  Check,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Phone,
  MapPin,
  Star,
  FileText,
  Inbox,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Flame,
  X,
  LayoutList,
  Kanban,
} from 'lucide-react';
import { TransitionStatusModal } from '../components/admin/TransitionStatusModal';
import { KanbanBoard } from '../components/admin/KanbanBoard';

export const AdminPetitionsPage: React.FC = () => {
  const { user } = useAuthStore();

  // Filter state
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    user?.role === 'Specialist' && user.departmentId ? user.departmentId : undefined
  );
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [isOverdueOnly, setIsOverdueOnly] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // View mode: 'list' (table) or 'kanban' (board)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Active drawer / quick view modal state
  const [selectedPetition, setSelectedPetition] = useState<AdminPetitionItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Workflow transition state & toast
  const [transitionPetition, setTransitionPetition] = useState<AdminPetitionItem | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Fetch Master Data
  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => masterDataApi.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const departments = deptsRes?.data || [];
  const categories = categoriesRes?.data || [];

  // Query parameters memoized
  // In kanban mode: load up to 100 items (no pagination), page always 1
  const effectivePageSize = viewMode === 'kanban' ? 100 : pageSize;
  const effectivePageNumber = viewMode === 'kanban' ? 1 : pageNumber;

  const queryParams = useMemo<AdminPetitionFilterParams>(() => {
    const params: AdminPetitionFilterParams = {
      pageNumber: effectivePageNumber,
      pageSize: effectivePageSize,
      sortBy,
      sortDesc,
    };

    if (keyword.trim()) params.keyword = keyword.trim();
    if (statusFilter !== undefined) params.status = statusFilter;
    if (priorityFilter !== undefined) params.priorityLevel = priorityFilter;
    if (departmentFilter) params.departmentId = departmentFilter;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (isOverdueOnly) params.isOverdue = true;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    return params;
  }, [
    keyword,
    statusFilter,
    priorityFilter,
    departmentFilter,
    categoryFilter,
    isOverdueOnly,
    dateFrom,
    dateTo,
    sortBy,
    sortDesc,
    effectivePageNumber,
    effectivePageSize,
  ]);

  // Fetch Admin Petitions
  const {
    data: petitionsRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminPetitions', queryParams],
    queryFn: () => adminApi.getPetitions(queryParams),
    staleTime: 1000 * 30, // 30s
  });

  const paginatedData = petitionsRes?.data;
  const petitions = paginatedData?.items || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = paginatedData?.totalPages || 1;

  // Handle Quick Copy Code
  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    if (user?.role !== 'Specialist') {
      setDepartmentFilter(undefined);
    }
    setIsOverdueOnly(false);
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortDesc(true);
    setPageNumber(1);
  };

  // Status Badge Helper
  const getStatusBadge = (status: number, statusName: string) => {
    switch (status) {
      case 1: // Submitted
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Inbox className="w-3.5 h-3.5 text-sky-600" />
            {statusName || 'Mới tiếp nhận'}
          </span>
        );
      case 2: // Assigned
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            {statusName || 'Đã phân công'}
          </span>
        );
      case 3: // Investigating
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {statusName || 'Đang xử lý'}
          </span>
        );
      case 4: // Resolved
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {statusName || 'Đã giải quyết'}
          </span>
        );
      case 5: // Rejected
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {statusName || 'Từ chối'}
          </span>
        );
      case 6: // Closed
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Check className="w-3.5 h-3.5 text-slate-500" />
            {statusName || 'Đã đóng'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {statusName}
          </span>
        );
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority: number, priorityName: string) => {
    switch (priority) {
      case 3: // Urgent
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
            {priorityName || 'Khẩn cấp'}
          </span>
        );
      case 2: // High
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {priorityName || 'Ưu tiên cao'}
          </span>
        );
      case 1: // Normal
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {priorityName || 'Tiêu chuẩn'}
          </span>
        );
    }
  };

  // SLA Time Display Helper
  const renderSlaIndicator = (item: AdminPetitionItem) => {
    if (item.status === 4 || item.status === 6) {
      return (
        <div className="flex items-center space-x-1 text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hoàn thành</span>
        </div>
      );
    }

    if (item.isOverdue) {
      return (
        <div className="flex items-center space-x-1.5 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Quá hạn SLA</span>
        </div>
      );
    }

    if (item.remainingHours !== undefined && item.remainingHours !== null) {
      const hours = Math.round(item.remainingHours);
      if (hours <= 24) {
        return (
          <div className="flex items-center space-x-1 text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Còn {hours}h nữa</span>
          </div>
        );
      }
      const days = Math.floor(hours / 24);
      return (
        <div className="flex items-center space-x-1 text-sky-700 text-xs font-medium bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
          <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>Còn {days} ngày</span>
        </div>
      );
    }

    return <span className="text-slate-400 text-xs">—</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#004d77] via-[#006194] to-[#0284c7] text-white py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-200 text-xs uppercase tracking-wider font-semibold">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span>Hệ thống Điều hành & Thụ lý Hồ sơ Cán bộ</span>
              <span className="text-sky-300">•</span>
              <span className="bg-white/15 px-2 py-0.5 rounded text-[11px] font-bold text-white">
                {user?.roleName || user?.role || 'Cán bộ'}
              </span>
              {user?.departmentName && (
                <span className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-400/30">
                  {user.departmentName}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              Quản lý & Giám sát Tiến độ Xử lý Phản ánh
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl">
              Tra cứu đa tiêu chí, phân loại chuyên sâu, giám sát cam kết SLA và tiếp nhận phản hồi đánh giá công dân theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/20">
              <button
                onClick={() => setViewMode('list')}
                title="Chế độ Bảng danh sách"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#006194] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Chế độ Bảng Kanban"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#006194] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold shadow-md hover:shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-5">
        {/* Action Success Toast */}
        {actionToast && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
              <span>{actionToast}</span>
            </div>
            <button
              onClick={() => setActionToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. QUICK STATUS TABS (Kanban style top filter) */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              setIsOverdueOnly(false);
              setPageNumber(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              statusFilter === undefined && !isOverdueOnly
                ? 'bg-[#006194] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Tất cả hồ sơ</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => {
              setStatusFilter(1);
              setIsOverdueOnly(false);
              setPageNumber(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              statusFilter === 1 && !isOverdueOnly
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-sky-50'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Mới tiếp nhận</span>
          </button>

          <button
            onClick={() => {
              setStatusFilter(2);
              setIsOverdueOnly(false);
              setPageNumber(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              statusFilter === 2 && !isOverdueOnly
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-indigo-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Đã phân công</span>
          </button>

          <button
            onClick={() => {
              setStatusFilter(3);
              setIsOverdueOnly(false);
              setPageNumber(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              statusFilter === 3 && !isOverdueOnly
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Đang xử lý</span>
          </button>

          <button
            onClick={() => {
              setStatusFilter(4);
              setIsOverdueOnly(false);
              setPageNumber(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              statusFilter === 4 && !isOverdueOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã giải quyết</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          <button
            onClick={() => {
              setIsOverdueOnly(!isOverdueOnly);
              setStatusFilter(undefined);
              setPageNumber(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              isOverdueOnly
                ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Quá hạn SLA</span>
          </button>
        </div>

        {/* 3. MULTI-CRITERIA FILTER TOOLBAR — hidden in Kanban mode */}
        {viewMode === 'kanban' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-xs">
            <Kanban className="w-4 h-4 text-[#006194]" />
            <span className="font-semibold text-slate-700">Chế độ Kanban:</span>
            <span>Hiển thị tối đa 100 hồ sơ gần nhất, nhóm theo trạng thái.</span>
            <span className="ml-auto text-[11px] text-slate-400">Dùng bộ lọc Status/Phòng ban bên trên để thu hẹp.</span>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Filter className="w-4 h-4 text-[#006194]" />
              <span>Bộ lọc nâng cao</span>
              {isFetching && (
                <span className="text-xs text-sky-600 font-normal animate-pulse">
                  (Đang tải dữ liệu...)
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tìm kiếm từ khóa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPageNumber(1);
                  }}
                  placeholder="Mã hồ sơ, tiêu đề, họ tên, số điện thoại, địa chỉ..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Phòng ban thụ lý
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={departmentFilter || ''}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value || undefined);
                    setPageNumber(1);
                  }}
                  disabled={user?.role === 'Specialist' && !!user.departmentId}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 bg-slate-50/50 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Lĩnh vực phản ánh
              </label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => {
                  setCategoryFilter(e.target.value || undefined);
                  setPageNumber(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 bg-slate-50/50 focus:bg-white transition-all"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.defaultSlaHours}h SLA)
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={priorityFilter !== undefined ? priorityFilter : ''}
                onChange={(e) => {
                  setPriorityFilter(e.target.value ? Number(e.target.value) : undefined);
                  setPageNumber(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 bg-slate-50/50 focus:bg-white transition-all"
              >
                <option value="">Tất cả mức ưu tiên</option>
                <option value="1">Tiêu chuẩn (Normal)</option>
                <option value="2">Ưu tiên cao (High)</option>
                <option value="3">Hỏa tốc / Khẩn cấp (Urgent)</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Từ ngày tiếp nhận
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Đến ngày tiếp nhận
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Sắp xếp theo
              </label>
              <div className="flex items-center space-x-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0284c7] bg-slate-50/50 focus:bg-white transition-all"
                >
                  <option value="createdAt">Thời gian tiếp nhận</option>
                  <option value="dueDate">Hạn xử lý (SLA)</option>
                  <option value="priority">Mức độ ưu tiên</option>
                  <option value="status">Trạng thái hồ sơ</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortDesc(!sortDesc)}
                  title={sortDesc ? 'Đang giảm dần (Click để tăng dần)' : 'Đang tăng dần (Click để giảm dần)'}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 4. PETITION DATA TABLE (List Mode) OR KANBAN BOARD */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            petitions={petitions}
            isLoading={isLoading}
            isFetching={isFetching}
            onTransition={(item) => setTransitionPetition(item)}
            onViewDetail={(item) => setSelectedPetition(item)}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          {/* Table Header Action Bar */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              Tìm thấy <strong className="text-slate-900 font-bold">{totalCount}</strong> hồ sơ phản ánh phù hợp
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-slate-500">Số dòng mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Mã tra cứu</th>
                  <th className="py-3 px-4 min-w-[240px]">Tiêu đề & Lĩnh vực</th>
                  <th className="py-3 px-4 min-w-[150px]">Người nộp</th>
                  <th className="py-3 px-4 min-w-[150px]">Đơn vị thụ lý</th>
                  <th className="py-3 px-4">Ưu tiên</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[120px]">Tiến độ SLA</th>
                  <th className="py-3 px-4 text-center">Đánh giá</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 rounded w-20"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28 mb-1"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-10 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-rose-600">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                      <p className="font-bold">Không thể tải danh sách hồ sơ</p>
                      <p className="text-xs text-slate-500 mt-1">Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700"
                      >
                        Thử lại ngay
                      </button>
                    </td>
                  </tr>
                ) : petitions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-500">
                      <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-base font-bold text-slate-700">Không tìm thấy hồ sơ nào</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Không có hồ sơ phản ánh nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Xóa toàn bộ bộ lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  petitions.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedPetition(item)}
                      className="hover:bg-sky-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Tracking Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-[#006194]">
                            {item.trackingCode}
                          </span>
                          <button
                            onClick={(e) => handleCopyCode(item.trackingCode, e)}
                            title="Sao chép mã tra cứu"
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {copiedCode === item.trackingCode ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/petitions/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#006194] transition-colors block"
                        >
                          {item.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                            {item.categoryName}
                          </span>
                          {item.addressText && (
                            <span className="inline-flex items-center space-x-0.5 text-[10px] text-slate-500 truncate max-w-[180px]">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                              <span className="truncate">{item.addressText}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitter */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {item.isAnonymous ? 'Ẩn danh' : item.citizenName || 'Người dân'}
                          </span>
                        </div>
                        {item.citizenPhone && !item.isAnonymous && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{item.citizenPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {item.departmentName || <span className="text-slate-400 italic">Chưa phân công</span>}
                        </div>
                        {item.assignedUserName && (
                          <div className="text-[11px] text-sky-700 font-semibold mt-0.5">
                            CV: {item.assignedUserName}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPriorityBadge(item.priorityLevel, item.priorityName)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status, item.statusName)}
                      </td>

                      {/* SLA */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderSlaIndicator(item)}
                        {item.dueDate && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.hasFeedback && item.feedbackRating ? (
                          <div className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>{item.feedbackRating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setTransitionPetition(item)}
                            disabled={item.status === 6}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={item.status === 6 ? 'Hồ sơ đã đóng' : 'Luân chuyển trạng thái / Phân công'}
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedPetition(item)}
                            className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-100 transition-colors"
                            title="Xem nhanh chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/petitions/${item.id}`}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Mở hồ sơ chi tiết toàn diện & Bản đồ GIS"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/track?code=${encodeURIComponent(item.trackingCode)}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                            title="Mở tiến độ công dân"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PAGINATION BAR */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Trang <strong className="text-slate-800 font-bold">{pageNumber}</strong> / {totalPages} 
              {' '}(Hiển thị {petitions.length} trên tổng số {totalCount} hồ sơ)
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1 || isLoading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && pageNumber > 3) {
                    pNum = pageNumber - 3 + i;
                    if (pNum > totalPages) pNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPageNumber(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        pageNumber === pNum
                          ? 'bg-[#006194] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages || isLoading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* 6. QUICK VIEW DETAIL DRAWER / MODAL */}
      {selectedPetition && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#006194] to-[#0284c7] text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
                    {selectedPetition.trackingCode}
                  </span>
                  <span className="text-xs text-sky-100">
                    • Tiếp nhận: {new Date(selectedPetition.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                  {selectedPetition.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPetition(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Trạng thái</span>
                  <div className="mt-1">{getStatusBadge(selectedPetition.status, selectedPetition.statusName)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mức ưu tiên</span>
                  <div className="mt-1">{getPriorityBadge(selectedPetition.priorityLevel, selectedPetition.priorityName)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tiến độ SLA</span>
                  <div className="mt-1">{renderSlaIndicator(selectedPetition)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Hạn giải quyết</span>
                  <div className="mt-1 font-semibold text-slate-800">
                    {selectedPetition.dueDate
                      ? new Date(selectedPetition.dueDate).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase block">Lĩnh vực chuyên ngành</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{selectedPetition.categoryName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase block">Phòng ban thụ lý</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedPetition.departmentName || 'Chưa phân công phòng ban'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase block">Chuyên viên phụ trách</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedPetition.assignedUserName || 'Chưa chỉ định chuyên viên'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase block">Người gửi phản ánh</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedPetition.isAnonymous ? 'Công dân gửi ẩn danh' : selectedPetition.citizenName || 'Không có tên'}
                    </p>
                    {selectedPetition.citizenPhone && !selectedPetition.isAnonymous && (
                      <p className="text-slate-500 font-mono text-[11px]">{selectedPetition.citizenPhone}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase block">Địa bàn xảy ra</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {selectedPetition.addressText || 'Không ghi địa chỉ cụ thể'}
                    </p>
                    {selectedPetition.administrativeUnitName && (
                      <p className="text-sky-700 text-[11px]">ĐVHC: {selectedPetition.administrativeUnitName}</p>
                    )}
                  </div>
                  {selectedPetition.hasFeedback && (
                    <div>
                      <span className="text-slate-400 font-bold text-[11px] uppercase block">Đánh giá hài lòng</span>
                      <div className="flex items-center space-x-1 mt-0.5 text-amber-700 font-bold">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span>{selectedPetition.feedbackRating} / 5 sao từ công dân</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedPetition(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center space-x-2">
                {selectedPetition.status !== 6 && (
                  <button
                    onClick={() => {
                      const target = selectedPetition;
                      setSelectedPetition(null);
                      setTransitionPetition(target);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Luân chuyển trạng thái</span>
                  </button>
                )}
                <Link
                  to={`/admin/petitions/${selectedPetition.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chi tiết toàn diện & GIS</span>
                </Link>
                <Link
                  to={`/track?code=${encodeURIComponent(selectedPetition.trackingCode)}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#0284c7] text-white transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cổng công dân</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. WORKFLOW TRANSITION MODAL */}
      {transitionPetition && (
        <TransitionStatusModal
          petition={transitionPetition}
          isOpen={!!transitionPetition}
          onClose={() => setTransitionPetition(null)}
          onSuccess={(msg) => {
            setActionToast(msg);
            setTimeout(() => setActionToast(null), 4000);
            refetch();
          }}
        />
      )}
    </div>
  );
};
