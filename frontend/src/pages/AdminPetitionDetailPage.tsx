import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Layers, 
  FileText, 
  Printer, 
  Clock, 
  User, 
  Phone, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Send, 
  Download, 
  Eye, 
  ExternalLink, 
  Copy, 
  Check, 
  Shield, 
  Flame, 
  AlertCircle,
  FileCheck2,
  Film,
  Image as ImageIcon,
  Loader2,
  GitMerge,
  CornerUpRight,
  FileX,
  Compass,
  Camera,
  MapPin,
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
  Users,
  CheckSquare
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { useAuthStore } from '../store/useAuthStore';
import { TransitionStatusModal } from '../components/admin/TransitionStatusModal';
import { ResolutionModal } from '../components/admin/ResolutionModal';
import { MediaLightbox } from '../components/admin/MediaLightbox';
import { MiniMapViewer } from '../components/admin/MiniMapViewer';
import { AddInspectionNoteModal } from '../components/admin/AddInspectionNoteModal';
import { ReviewResolutionModal } from '../components/admin/ReviewResolutionModal';
import { AssignMemberModal } from '../components/admin/AssignMemberModal';
import { InspectionReportModal } from '../components/admin/InspectionReportModal';
import { InternalThreadPanel } from '../components/admin/InternalThreadPanel';
import type { AdminPetitionItem } from '../types';
import { canAccessPetition } from '../utils/permissions';

export const AdminPetitionDetailPage: React.FC = () => {
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Modals & Lightbox states
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [transitionInitialStatus, setTransitionInitialStatus] = useState<number | null>(null);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isBeginningInvestigation, setIsBeginningInvestigation] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<'close' | 'rework'>('close');
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Unit Team Workflow states (Phân công thành viên & Báo cáo nghiệm thu)
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isInspectionReportOpen, setIsInspectionReportOpen] = useState(false);
  const [inspectionReportMode, setInspectionReportMode] = useState<'submit' | 'review'>('submit');
  const [activeInternalTab, setActiveInternalTab] = useState<'thread' | 'notes'>('thread');

  // Quick feedback state
  const [copiedCode, setCopiedCode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Petition Detail
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-petition-detail', id],
    queryFn: () => adminApi.getPetitionDetail(id!),
    enabled: !!id,
  });

  const petition = response?.data;

  // Tính toán quyền hạn theo State Machine và Vai trò
  // [Yêu cầu 4] Tính năng Luân chuyển trạng thái chỉ dành cho cán bộ tiếp nhận (điều phối / admin)
  const canTransition = (() => {
    if (!petition || petition.status === 6 || !user) return false;
    // Chống xung đột lợi ích: Cán bộ không được thao tác trên đơn của chính mình
    if (petition.isConflictOfInterest) return false;

    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Dispatcher') {
      return petition.status >= 1 && petition.status <= 5;
    }
    // Cán bộ chuyên môn (Specialist) không có thẩm quyền luân chuyển trạng thái tự do, ẩn đi
    return false;
  })();

  const canResolve = (() => {
    if (!petition || !user) return false;
    if (petition.isConflictOfInterest) return false;
    // Tuần tự: Phải đang ở giai đoạn Thẩm tra (Investigating = 3)
    if (petition.status !== 3) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist' && user.isUnitLead) {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  const canReassign = (() => {
    if (!petition || petition.status === 6 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin' || user.role === 'Dispatcher') return true;
    if (user.role === 'Specialist' && user.isUnitLead) {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  // [Yêu cầu 3] Nút Bắt đầu thẩm tra: chỉ xuất hiện ở nhân viên xử lý khi trưởng đơn vị điều phối cho nhân viên của mình
  const canBeginInvestigation = (() => {
    if (!petition || petition.status !== 2 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist') {
      const isSameDept = canAccessPetition(user.role, user.departmentId, petition.departmentId);
      if (!isSameDept) return false;
      // Chỉ xuất hiện khi đã được phân công nhân viên và người đăng nhập chính là nhân viên đó
      return !!petition.assignedUserId && petition.assignedUserId === user.id;
    }
    return false;
  })();

  // [Yêu cầu 2] Quyền ban hành/chỉnh sửa văn bản kết luận: chỉ Trưởng đơn vị phụ trách hoặc SuperAdmin
  const canManageResolution = (() => {
    if (!petition || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist' && user.isUnitLead) {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  // [Yêu cầu 2] Điều kiện hiển thị khối Văn bản kết luận: chỉ khi đã nghiệm thu xong hoặc đã có kết luận
  const isInspectionCompleted = !!petition?.inspectionReportApprovedAt || petition?.status === 5 || petition?.status === 6 || !!petition?.resolution;

  // [Task 4.1] Quyền lập biên bản / ghi chú thực địa kèm ảnh GPS
  const canAddInspectionNote = (() => {
    if (!petition || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (petition.status !== 2 && petition.status !== 3) return false;
    if (user.role === 'SuperAdmin' || user.role === 'Dispatcher') return true;
    if (user.role === 'Specialist') {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  // [Task 4.1] Kích hoạt nhánh NeedInfo từ hiện trường nếu thiếu căn cứ xác minh
  const canRequestNeedInfo = (() => {
    if (!petition || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (petition.status !== 2 && petition.status !== 3) return false;
    return canTransition;
  })();

  // [Task 5.1] Quyền kiểm duyệt kết quả giải quyết (Phê duyệt đóng đơn hoặc Yêu cầu xử lý lại)
  const canReviewResolution = (() => {
    if (!petition || petition.status !== 4 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    return user.role === 'SuperAdmin' || user.role === 'Dispatcher';
  })();

  // [Task-Unit-Workflow] Quyền phân công thành viên nội bộ đơn vị (Tầng 2)
  const canAssignMember = (() => {
    if (!petition || petition.status === 6 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist' && user.isUnitLead) {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  // [Task-Unit-Workflow] Quyền nộp báo cáo nghiệm thu thực địa (Chuyên viên đang thẩm tra status=3)
  const canSubmitInspectionReport = (() => {
    if (!petition || petition.status !== 3 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist') {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  // [Task-Unit-Workflow] Quyền thẩm định & duyệt báo cáo nghiệm thu (Chỉ Trưởng đơn vị status=11)
  const canReviewInspectionReport = (() => {
    if (!petition || petition.status !== 11 || !user) return false;
    if (petition.isConflictOfInterest) return false;
    if (user.role === 'SuperAdmin') return true;
    if (user.role === 'Specialist' && user.isUnitLead) {
      return canAccessPetition(user.role, user.departmentId, petition.departmentId);
    }
    return false;
  })();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBeginInvestigation = async () => {
    if (!petition || isBeginningInvestigation) return;
    try {
      setIsBeginningInvestigation(true);
      const res = await adminApi.beginInvestigation(petition.id);
      showToast(res.message || 'Đã bắt đầu thẩm tra thực địa thành công.');
      refetch();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError?.response?.data?.message || 'Không thể bắt đầu thẩm tra. Vui lòng thử lại.');
    } finally {
      setIsBeginningInvestigation(false);
    }
  };

  const copyTrackingCode = () => {
    if (!petition) return;
    navigator.clipboard.writeText(petition.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    try {
      setIsSubmittingComment(true);
      await adminApi.addComment(id, commentText.trim());
      setCommentText('');
      showToast('Đã lưu ghi chú nghiệp vụ nội bộ.');
      refetch();
    } catch {
      showToast('Không thể lưu ghi chú. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#006194] animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Đang tải toàn bộ hồ sơ vụ việc...</p>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy hồ sơ</h2>
          <p className="text-xs text-slate-500">
            Hồ sơ phản ánh không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập hồ sơ của phòng ban này.
          </p>
          <button
            onClick={() => navigate('/admin/petitions')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>
        </div>
      </div>
    );
  }

  // Convert to AdminPetitionItem format for TransitionStatusModal
  const modalPetitionItem: AdminPetitionItem = {
    id: petition.id,
    trackingCode: petition.trackingCode,
    title: petition.title,
    categoryName: petition.categoryName,
    categoryCode: petition.categoryCode,
    status: petition.status,
    statusName: petition.statusName,
    priorityLevel: petition.priorityLevel,
    priorityName: petition.priorityName,
    departmentName: petition.departmentName,
    assignedUserName: petition.assignedUserName,
    citizenName: petition.citizenName,
    citizenPhone: petition.citizenPhone,
    isAnonymous: petition.isAnonymous,
    addressText: petition.addressText,
    administrativeUnitName: petition.administrativeUnitName,
    createdAt: petition.createdAt,
    dueDate: petition.dueDate,
    resolvedAt: petition.resolvedAt,
    isOverdue: petition.isOverdue,
    remainingHours: petition.remainingHours,
    attachmentsCount: petition.attachments.length,
    hasFeedback: petition.hasFeedback,
    feedbackRating: petition.feedbackRating,
  };

  // Status Badge Helper
  const getStatusBadge = (status: number, name: string) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>{name}</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{name}</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{name}</span>
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{name}</span>
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{name}</span>
          </span>
        );
      case 6:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <span>{name}</span>
          </span>
        );
      case 7:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{name}</span>
          </span>
        );
      case 8:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <GitMerge className="w-3.5 h-3.5 text-purple-600" />
            <span>{name}</span>
          </span>
        );
      case 9:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
            <CornerUpRight className="w-3.5 h-3.5 text-cyan-600" />
            <span>{name}</span>
          </span>
        );
      case 10:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            <FileX className="w-3.5 h-3.5 text-slate-600" />
            <span>{name}</span>
          </span>
        );
      case 11:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-900 border border-violet-300 shadow-xs">
            <ClipboardCheck className="w-3.5 h-3.5 text-violet-700 animate-pulse" />
            <span>{name}</span>
          </span>
        );
      default:
        return <span>{name}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP CONTROL BAR */}
      <div className="bg-gradient-to-r from-[#004d77] via-[#006194] to-[#0284c7] text-white py-5 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumb & Back */}
          <div className="flex items-center justify-between">
            <Link
              to="/admin/petitions"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-200 hover:text-white transition-colors bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Danh sách Hồ sơ</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 cursor-pointer whitespace-nowrap shrink-0"
                title="In phiếu hồ sơ khổ A4"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">In hồ sơ</span>
              </button>

              {/* Nút Xem như người dân (petition.previewPublic) */}
              <Link
                to={`/tracking?code=${petition.trackingCode}&preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 text-xs font-semibold transition-all border border-sky-300/40 cursor-pointer whitespace-nowrap shrink-0"
                title="Xem trước giao diện công khai như người dân thấy (Chỉ đọc)"
              >
                <Eye className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Xem như người dân</span>
              </Link>

              {/* [Task-Unit-Workflow] Nút Phân công Cán bộ nội bộ đơn vị (Tầng 2) */}
              {canAssignMember && (petition.status === 2 || petition.status === 3) && (
                <button
                  onClick={() => setIsAssignMemberOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
                  title="Trưởng đơn vị cử cán bộ trực tiếp thụ lý vụ việc"
                >
                  <Users className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="whitespace-nowrap">Phân công cán bộ</span>
                </button>
              )}

              {/* [Task-Unit-Workflow] Nút Cán bộ nộp báo cáo nghiệm thu lên Trưởng đơn vị */}
              {canSubmitInspectionReport && (
                <button
                  onClick={() => {
                    setInspectionReportMode('submit');
                    setIsInspectionReportOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
                  title="Nộp báo cáo nghiệm thu thực địa lên Trưởng đơn vị phê duyệt"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="whitespace-nowrap">Nộp báo cáo nghiệm thu</span>
                </button>
              )}

              {/* [Task-Unit-Workflow] Nút Trưởng đơn vị Thẩm định & Duyệt nghiệm thu (status=11) */}
              {canReviewInspectionReport && (
                <button
                  onClick={() => {
                    setInspectionReportMode('review');
                    setIsInspectionReportOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer animate-pulse whitespace-nowrap shrink-0"
                  title="Trưởng đơn vị thẩm định và ban hành kết luận giải quyết"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">Thẩm định & Duyệt nghiệm thu</span>
                </button>
              )}

              {/* [Task 4.1] Nút Bắt đầu thẩm tra thực địa: Assigned (2) -> Investigating (3) */}
              {canBeginInvestigation && (
                <button
                  onClick={handleBeginInvestigation}
                  disabled={isBeginningInvestigation}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                  title="Chuyển trạng thái sang Đang thẩm tra (Investigating)"
                >
                  {isBeginningInvestigation ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">Bắt đầu thẩm tra</span>
                </button>
              )}

              {/* [Task 4.1] Nút Lập biên bản thực địa & ảnh GPS */}
              {canAddInspectionNote && (
                <button
                  onClick={() => setIsInspectionOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Ghi chép quan sát, lập biên bản kiểm tra, đính kèm ảnh GPS"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                  <span className="whitespace-nowrap">Biên bản thực địa</span>
                </button>
              )}

              {/* [Task 4.1] Nút Kích hoạt nhánh NeedInfo từ hiện trường nếu thiếu căn cứ */}
              {canRequestNeedInfo && (petition.status === 2 || petition.status === 3) && (
                <button
                  onClick={() => {
                    setTransitionInitialStatus(7); // NeedInfo
                    setIsTransitionOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-300/40 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Yêu cầu người dân bổ sung thêm thông tin khi thiếu căn cứ xác minh"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Yêu cầu bổ sung</span>
                </button>
              )}

              {canTransition && (
                <button
                  onClick={() => {
                    setTransitionInitialStatus(null);
                    setIsTransitionOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#006194] hover:bg-sky-50 text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                  title="Chuyển trạng thái hồ sơ theo quy trình"
                >
                  <Layers className="w-3.5 h-3.5 text-[#006194] shrink-0" />
                  <span className="whitespace-nowrap">Luân chuyển trạng thái</span>
                </button>
              )}

              {canResolve && (
                <button
                  onClick={() => setIsResolutionOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
                  title="Ban hành kết luận giải quyết chính thức"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">Ban hành kết luận</span>
                </button>
              )}

              {/* [Task 5.1] Nút Kiểm duyệt đóng đơn & Rework trên Top Bar */}
              {canReviewResolution && (
                <>
                  <button
                    onClick={() => {
                      setReviewModalMode('close');
                      setIsReviewModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
                    title="Phê duyệt kết luận và Đóng hồ sơ (Closed)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span className="whitespace-nowrap">Duyệt & Đóng đơn</span>
                  </button>

                  <button
                    onClick={() => {
                      setReviewModalMode('rework');
                      setIsReviewModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
                    title="Yêu cầu chuyên viên xử lý lại (Rework -> Investigating)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Yêu cầu xử lý lại</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dossier Title and Main Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyTrackingCode}
                  className="inline-flex items-center space-x-1 font-mono font-bold text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors border border-white/20"
                  title="Bấm để sao chép mã"
                >
                  <span>{petition.trackingCode}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/70" />}
                </button>
                <span className="bg-sky-400/30 text-sky-100 border border-sky-300/40 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {petition.categoryName}
                </span>
                {petition.priorityLevel === 3 ? (
                  <span className="inline-flex items-center space-x-1 bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-md animate-pulse">
                    <Flame className="w-3 h-3 text-white" />
                    <span>Khẩn cấp</span>
                  </span>
                ) : petition.priorityLevel === 2 ? (
                  <span className="inline-flex items-center space-x-1 bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-md">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Ưu tiên cao</span>
                  </span>
                ) : null}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {petition.title}
              </h1>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {getStatusBadge(petition.status, petition.statusName)}
            </div>
          </div>
        </div>
      </div>

      {/* WORKFLOW STEPPER BAR */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          {[
            { status: 1, title: '1. Tiếp nhận', desc: 'Mới gửi' },
            { status: 2, title: '2. Phân công', desc: petition.assignedUserName || (petition.departmentName ? `${petition.departmentName} (Chờ cử cán bộ)` : 'Chờ phân công') },
            { status: 3, title: '3. Thụ lý', desc: 'Đang xác minh' },
            { status: 11, title: '4. Nghiệm thu', desc: 'Thẩm định kết quả' },
            { status: 4, title: '5. Kết luận', desc: 'Đã giải quyết' },
            { status: 6, title: '6. Hoàn tất', desc: 'Đóng/Lưu trữ' }
          ].map((st, idx, arr) => {
            const isCurrent = petition.status === st.status;
            const isPassed = (() => {
              if (petition.status === 5) return false;
              if (st.status === 1) return petition.status > 1;
              if (st.status === 2) return [3, 11, 4, 6].includes(petition.status);
              if (st.status === 3) return [11, 4, 6].includes(petition.status);
              if (st.status === 11) return [4, 6].includes(petition.status);
              if (st.status === 4) return petition.status === 6;
              return false;
            })();
            return (
              <React.Fragment key={st.status}>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-sky-400 text-slate-950 ring-2 ring-sky-300 font-extrabold scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <div className="hidden md:block">
                    <div className={`font-bold text-[11px] ${isCurrent ? 'text-sky-300 font-bold' : isPassed ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      {st.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{st.desc}</div>
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${isPassed ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN BODY: 2-COLUMN DOSSIER LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Banner cảnh báo xung đột lợi ích (Mục 6.15 & Kịch bản 25) */}
        {petition.isConflictOfInterest && (
          <div className="mb-6 bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start space-x-3 text-rose-900 shadow-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-sm text-rose-950">
                Cảnh báo Xung đột lợi ích — Hồ sơ do chính bạn gửi với tư cách công dân!
              </p>
              <p>
                Theo quy chế phân quyền ReflectGov, bạn <strong>không được phép</strong> phân công, điều chuyển, thẩm tra hiện trường, ban hành kết luận hoặc đóng hồ sơ đối với đơn này nhằm đảm bảo tính khách quan và minh bạch.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT / MAIN DOSSIER COLUMN (7/12) */}
          <div className="lg:col-span-8 space-y-6">

            {/* EXCEPTION BANNERS */}
            {petition.status === 11 && (
              <div className="bg-violet-50 border-l-4 border-violet-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-violet-950 animate-in fade-in">
                <ClipboardCheck className="w-5 h-5 text-violet-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-violet-900 text-sm">
                      Hồ sơ đang chờ Trưởng đơn vị thẩm định & phê duyệt Báo cáo nghiệm thu
                    </span>
                    {canReviewInspectionReport && (
                      <button
                        onClick={() => {
                          setInspectionReportMode('review');
                          setIsInspectionReportOpen(true);
                        }}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Thẩm định ngay
                      </button>
                    )}
                  </div>
                  <p className="text-violet-800">
                    Cán bộ được phân công đã nộp báo cáo kết quả kiểm tra thực địa. Trưởng đơn vị tiến hành thẩm tra hồ sơ, phê duyệt để ban hành kết luận chính thức hoặc yêu cầu cán bộ thẩm tra lại.
                  </p>
                </div>
              </div>
            )}

            {petition.status === 7 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-amber-950 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-900 text-sm">
                    Hồ sơ đang tạm dừng để chờ người dân bổ sung thông tin (Lần {petition.needInfoCount || 1}/2)
                  </div>
                  <p className="text-amber-800">
                    <strong>Nội dung yêu cầu bổ sung:</strong> {petition.needInfoReason || 'Chờ người dân cung cấp thêm thông tin hiện trường'}
                  </p>
                  {petition.needInfoDeadline && (
                    <p className="text-amber-700 text-[11px]">
                      <strong>Hạn chót bổ sung:</strong> {new Date(petition.needInfoDeadline).toLocaleString('vi-VN')} • SLA cán bộ đang tạm dừng tính giờ.
                    </p>
                  )}
                </div>
              </div>
            )}

            {petition.status === 8 && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-purple-950 animate-in fade-in">
                <GitMerge className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-purple-900 text-sm">
                    Hồ sơ đã được gộp do trùng lặp nội dung phản ánh
                  </div>
                  <p className="text-purple-800">
                    Đã gộp vào hồ sơ gốc: <strong className="font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-950">{petition.duplicateOfTrackingCode || 'Hồ sơ gốc'}</strong>
                  </p>
                </div>
              </div>
            )}

            {petition.status === 9 && (
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-cyan-950 animate-in fade-in">
                <CornerUpRight className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-cyan-900 text-sm">
                    Hồ sơ đã được chuyển tiếp sang cơ quan ngoài ngành
                  </div>
                  <p className="text-cyan-800">
                    <strong>Cơ quan tiếp nhận:</strong> {petition.forwardToOrganization || 'Cơ quan có thẩm quyền'}
                  </p>
                  {petition.forwardReason && (
                    <p className="text-cyan-700 text-[11px]">
                      <strong>Lý do chuyển tiếp:</strong> {petition.forwardReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {petition.status === 10 && (
              <div className="bg-slate-100 border-l-4 border-slate-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-slate-800 animate-in fade-in">
                <FileX className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">
                    Người dân đã chủ động rút phản ánh kiến nghị này
                  </div>
                  {petition.withdrawnReason && (
                    <p className="text-slate-700">
                      <strong>Lý do rút:</strong> {petition.withdrawnReason}
                    </p>
                  )}
                  {petition.withdrawnAt && (
                    <p className="text-slate-500 text-[11px]">
                      Thời điểm rút: {new Date(petition.withdrawnAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* [Task 5.1] Banner Hồ sơ đã đóng (Closed) */}
            {petition.status === 6 && (
              <div className="bg-slate-100 border-l-4 border-slate-600 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-slate-800 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">
                    Hồ sơ đã được phê duyệt và đóng lưu trữ (Closed)
                  </div>
                  {petition.closedAt ? (
                    <p className="text-slate-600 text-[11px]">
                      Thời điểm đóng: {new Date(petition.closedAt).toLocaleString('vi-VN')}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-[11px]">
                      Hồ sơ đã hoàn tất toàn bộ chu trình xử lý.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* [Task 5.1] Banner Cảnh báo Rework nếu hồ sơ đã từng bị yêu cầu xử lý lại */}
            {petition.reworkCount !== undefined && petition.reworkCount > 0 && (
              <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 rounded-2xl shadow-xs flex items-start space-x-3 text-xs text-amber-950 animate-in fade-in">
                <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm">
                      Hồ sơ đã qua {petition.reworkCount} lần yêu cầu xử lý lại (Rework)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      {petition.status === 3 ? 'Chờ khắc phục' : 'Đã xử lý lại'}
                    </span>
                  </div>
                  {petition.reworkReason && (
                    <p className="text-amber-900/90 leading-relaxed font-medium bg-amber-100/70 p-2.5 rounded-xl border border-amber-200/80 mt-1">
                      <strong>Lý do trả về gần nhất:</strong> {petition.reworkReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* A. Nội dung phản ánh chi tiết */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#006194]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Chi Tiết Phản Ánh Hiện Trường</h2>
                    <p className="text-[11px] text-slate-500">
                      Gửi lúc: {new Date(petition.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/track?code=${encodeURIComponent(petition.trackingCode)}`}
                  target="_blank"
                  className="inline-flex items-center space-x-1 text-xs text-sky-700 hover:text-sky-900 font-semibold"
                  title="Xem giao diện công dân"
                >
                  <span>Cổng công dân</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200/60 font-medium">
                {petition.content}
              </div>
            </div>

            {/* B. Album Minh chứng Thực địa (Ảnh / Video / PDF) */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Minh Chứng Hiện Trường ({petition.attachments.length})
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Hình ảnh, video quay tại tọa độ hoặc tệp tài liệu do người dân cung cấp
                    </p>
                  </div>
                </div>
              </div>

              {petition.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {petition.attachments.map((att, idx) => {
                    const isVid = att.fileType?.toLowerCase().includes('video') || /\.(mp4|mov|webm)$/i.test(att.fileName);
                    return (
                      <div
                        key={att.id || idx}
                        onClick={() => {
                          setLightboxIndex(idx);
                          setIsLightboxOpen(true);
                        }}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer aspect-square shadow-xs hover:shadow-md transition-all"
                      >
                        {isVid ? (
                          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-2">
                            <Film className="w-8 h-8 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">
                              Video Clip
                            </span>
                          </div>
                        ) : (
                          <img
                            src={att.fileUrl}
                            alt={att.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                          <span className="text-[10px] text-white truncate max-w-[90px] font-medium">
                            {att.originalFileName || att.fileName}
                          </span>
                          <span className="p-1 rounded-md bg-white/30 text-white">
                            <Eye className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-medium">Hồ sơ không có tệp đính kèm.</p>
                </div>
              )}
            </div>

            {/* C. Bản đồ vị trí GIS hiện trường */}
            <MiniMapViewer
              latitude={petition.latitude}
              longitude={petition.longitude}
              addressText={petition.addressText}
              administrativeUnitName={petition.administrativeUnitName}
            />

            {/* D1. Báo Cáo Nghiệm Thu Thực Địa (Internal Inspection & Acceptance) */}
            {(petition.inspectionReport || petition.status === 11) && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-violet-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Báo Cáo Nghiệm Thu Thực Địa Đơn Vị</h2>
                      <p className="text-[11px] text-slate-500">
                        Cán bộ kiểm tra thực tế, lập báo cáo thẩm tra và đề xuất kết luận lên Trưởng đơn vị
                      </p>
                    </div>
                  </div>

                  {/* Trạng thái duyệt báo cáo */}
                  {petition.inspectionReportApprovedAt ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trưởng đơn vị đã phê chuẩn</span>
                    </span>
                  ) : petition.status === 11 ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300 animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-violet-600" />
                      <span>Chờ Trưởng đơn vị thẩm định</span>
                    </span>
                  ) : null}
                </div>

                {/* Banner lý do yêu cầu thẩm tra lại (nếu có) */}
                {petition.inspectionRejectionReason && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300/80 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center space-x-1 text-amber-900">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ý kiến chỉ đạo yêu cầu thẩm tra bổ sung của Trưởng đơn vị:</span>
                    </div>
                    <p className="pl-5 text-amber-900 italic font-medium">{petition.inspectionRejectionReason}</p>
                  </div>
                )}

                {/* Thân báo cáo nghiệm thu */}
                {petition.inspectionReport ? (
                  <div className="bg-gradient-to-br from-violet-50/50 via-slate-50 to-white rounded-xl border border-violet-200/70 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-b border-violet-100/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">Cán bộ nộp: {petition.assignedUserName || 'Chuyên viên phụ trách'}</span>
                        {petition.inspectionReportSubmittedAt && (
                          <span className="text-[11px] text-slate-400">
                            • {new Date(petition.inspectionReportSubmittedAt).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                      {petition.inspectionReportApprovedAt && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Phê duyệt lúc: {new Date(petition.inspectionReportApprovedAt).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line bg-white/80 p-3.5 rounded-lg border border-slate-200/60">
                      {petition.inspectionReport}
                    </div>

                    {/* Actions cho Trưởng đơn vị hoặc Cán bộ */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {canSubmitInspectionReport && (
                        <button
                          onClick={() => {
                            setInspectionReportMode('submit');
                            setIsInspectionReportOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Cập nhật báo cáo nghiệm thu
                        </button>
                      )}
                      {canReviewInspectionReport && (
                        <button
                          onClick={() => {
                            setInspectionReportMode('review');
                            setIsInspectionReportOpen(true);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Thẩm định & Phê duyệt nghiệm thu</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-violet-200 text-center bg-violet-50/40 text-xs text-violet-800 space-y-2">
                    <p className="font-semibold">Hồ sơ chưa có báo cáo nghiệm thu thực địa bằng văn bản.</p>
                    {canSubmitInspectionReport && (
                      <button
                        onClick={() => {
                          setInspectionReportMode('submit');
                          setIsInspectionReportOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Nộp báo cáo nghiệm thu ngay
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* D. Khối Kết Luận Giải Quyết Chính Thức (Official Resolution) - [Yêu cầu 2] Chỉ hiển thị khi đã nghiệm thu xong */}
            {isInspectionCompleted && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Văn Bản Kết Luận & Quyết Định Xử Lý</h2>
                      <p className="text-[11px] text-slate-500">
                        Kết luận chính thức của cơ quan thẩm quyền ban hành đến công dân
                      </p>
                    </div>
                  </div>

                  {petition.resolution && canManageResolution && (
                    <button
                      onClick={() => setIsResolutionOpen(true)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      Chỉnh sửa văn bản
                    </button>
                  )}
                </div>

                {petition.resolution ? (
                  <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-sky-50/40 border-2 border-emerald-200/90 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xs">
                    {/* Watermark seal */}
                    <div className="absolute right-3 -bottom-4 opacity-10 pointer-events-none">
                      <Shield className="w-36 h-36 text-emerald-900" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                          {petition.resolution.documentNumber || 'VĂN BẢN KẾT LUẬN CHÍNH THỨC'}
                        </span>

                        {/* [Task 4.2] Badge phân loại kết luận pháp lý */}
                        {petition.conclusionType === 1 || petition.conclusionType === 'Valid' || petition.resolution.conclusionType === 1 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Đúng sự thật
                          </span>
                        ) : petition.conclusionType === 2 || petition.conclusionType === 'PartiallyValid' || petition.resolution.conclusionType === 2 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⚠ Đúng một phần
                          </span>
                        ) : petition.conclusionType === 3 || petition.conclusionType === 'InsufficientEvidence' || petition.resolution.conclusionType === 3 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            ✕ Không đủ căn cứ / Sai sự thật
                          </span>
                        ) : null}

                        {/* [Task 4.2] Chốt mốc SLA giải quyết */}
                        {petition.isOverdue ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500 text-white shadow-xs">
                            Quá hạn SLA
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-600 text-white shadow-xs">
                            Đúng hạn SLA
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500">
                          Ban hành: {new Date(petition.resolution.issuedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      {petition.resolution.approvedByName && (
                        <span className="text-xs font-semibold text-slate-700">
                          Người ký: <strong className="text-slate-900">{petition.resolution.approvedByName}</strong>
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-800 leading-relaxed font-medium bg-white/90 p-4 rounded-xl border border-emerald-100 shadow-xs whitespace-pre-line">
                      {petition.resolution.conclusionText}
                    </div>

                    {/* [Task 4.2] Khung Tóm tắt công khai (Public Summary) */}
                    {(petition.publicSummary || petition.resolution.publicSummary) && (
                      <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3.5 space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 font-bold text-[#006194]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tóm tắt công khai hiển thị cho công dân & bản đồ GIS:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium pl-5">
                          {petition.publicSummary || petition.resolution.publicSummary}
                        </p>
                      </div>
                    )}

                    {petition.resolution.officialDocumentUrl && (
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span>Văn bản có con dấu / Ký số:</span>
                        </div>
                        <a
                          href={petition.resolution.officialDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải văn bản chính thức</span>
                        </a>
                      </div>
                    )}

                    {/* [Task 5.1] Dispatcher Quality Gate Review Bar */}
                    {canReviewResolution && (
                      <div className="mt-4 pt-4 border-t border-emerald-300/60 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Khu vực Kiểm duyệt của Điều phối viên (Quality Gate):</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Chuyên viên đã ban hành kết luận giải quyết. Vui lòng rà soát tính chuẩn xác của kết quả trước khi phê duyệt đóng đơn hoặc gửi yêu cầu khắc phục lại.
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <button
                            onClick={() => {
                              setReviewModalMode('close');
                              setIsReviewModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Phê duyệt & Đóng hồ sơ</span>
                          </button>

                          <button
                            onClick={() => {
                              setReviewModalMode('rework');
                              setIsReviewModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Yêu cầu xử lý lại (Rework)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : canManageResolution ? (
                  <div className="rounded-xl border border-dashed border-emerald-300 p-6 text-center bg-emerald-50/40 space-y-3">
                    <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Đã hoàn thành nghiệm thu thực địa</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Trưởng đơn vị tiến hành ban hành kết luận xử lý chính thức cho công dân tại đây.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsResolutionOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Ban hành kết luận ngay</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium">Hồ sơ đã hoàn tất nghiệm thu thực địa. Đang chờ Trưởng đơn vị ký duyệt ban hành văn bản kết luận chính thức.</p>
                  </div>
                )}
              </div>
            )}

            {/* E. Đánh giá của Người dân (Nếu có) */}
            {petition.hasFeedback && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Đánh Giá Mức Độ Hài Lòng Của Người Dân</h2>
                    <p className="text-[11px] text-slate-500">Phản hồi thực tế từ công dân sau khi nhận được giải quyết</p>
                  </div>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex items-start space-x-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-amber-200 shadow-xs shrink-0">
                    <span className="text-2xl font-black text-amber-600">{petition.feedbackRating}</span>
                    <div className="flex items-center space-x-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= (petition.feedbackRating || 0)
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Ý kiến nhận xét:</p>
                    <p className="text-xs text-slate-700 italic">
                      "{petition.feedbackComment || 'Người dân không để lại bình luận bổ sung.'}"
                    </p>
                    {petition.feedbackCreatedAt && (
                      <p className="text-[10px] text-slate-400 pt-1">
                        Gửi lúc: {new Date(petition.feedbackCreatedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Luồng Đề nghị xem xét lại (Task 5.2 CSAT <= 2 sao) */}
                {petition.reopenStatus && petition.reopenStatus > 0 ? (
                  <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Công dân yêu cầu mở lại / xem xét lại hồ sơ ({petition.reopenStatusName})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {petition.reopenStatus === 1 ? 'Chờ Dispatcher duyệt' : petition.reopenStatus === 2 ? 'Đã duyệt mở lại' : 'Từ chối'}
                      </span>
                    </div>
                    {petition.reopenReason && (
                      <p className="text-slate-700 bg-white/80 p-2 rounded-lg border border-rose-100 italic">
                        "{petition.reopenReason}"
                      </p>
                    )}
                    {petition.reopenedAt && (
                      <p className="text-[10px] text-slate-500">
                        Thời điểm gửi yêu cầu: {new Date(petition.reopenedAt).toLocaleString('vi-VN')} • Số lần đã mở lại: {petition.reopenCount || 0}/1
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* F. Trao Đổi Nghiệp Vụ Nội Bộ & Sổ Tay Cán Bộ */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInternalTab('thread')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeInternalTab === 'thread'
                      ? 'border-[#006194] bg-white text-[#006194] shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#006194]" />
                  <span>Kênh Trao Đổi Nội Bộ Đơn Vị</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInternalTab('notes')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeInternalTab === 'notes'
                      ? 'border-[#006194] bg-white text-[#006194] shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                  <span>Sổ Tay & Biên Bản Thực Địa</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {petition.comments.length}
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {activeInternalTab === 'thread' ? (
                  <InternalThreadPanel
                    petitionId={petition.id}
                    trackingCode={petition.trackingCode}
                    departmentName={petition.departmentName}
                    currentUser={user}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Sổ Tay Nghiệp Vụ & Biên Bản Thực Địa ({petition.comments.length})
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Biên bản khảo sát, mẫu vật chứng cứ, ảnh GPS và các mốc xác minh
                        </p>
                      </div>

                      {canAddInspectionNote && (
                        <button
                          type="button"
                          onClick={() => setIsInspectionOpen(true)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Lập biên bản</span>
                        </button>
                      )}
                    </div>

                    {/* Comments stream */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {petition.comments.length > 0 ? (
                        petition.comments.map((cmt) => {
                          const isInspectionReport = cmt.content.includes('[📋 Biên bản') || cmt.content.includes('[🔍 Thu thập mẫu') || cmt.content.includes('[🏞️ Quan sát');
                          const hasGps = cmt.content.includes('📍 GPS hiện trường:');
                          
                          return (
                            <div
                              key={cmt.id}
                              className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                                isInspectionReport
                                  ? 'bg-gradient-to-br from-sky-50/70 to-slate-50 border-sky-200/90 shadow-xs'
                                  : 'bg-slate-50 rounded-xl border-slate-200/70'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                                  {isInspectionReport ? (
                                    <ClipboardCheck className="w-3.5 h-3.5 text-[#006194]" />
                                  ) : (
                                    <User className="w-3 h-3 text-[#006194]" />
                                  )}
                                  <span>{cmt.authorName}</span>
                                  {isInspectionReport && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#006194] text-white text-[10px] font-bold">
                                      Thực địa
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-400">
                                  {new Date(cmt.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                                {cmt.content}
                              </div>

                              {hasGps && (
                                <div className="pt-1 flex items-center space-x-1.5 text-[11px] font-bold text-sky-800">
                                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Đã xác thực tọa độ GPS hiện trường</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                          Chưa có ghi chú nội bộ nào. Thêm ghi chú hoặc biên bản thực địa đầu tiên bên dưới.
                        </p>
                      )}
                    </div>

                    {/* Add comment input */}
                    <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Ghi chú nội bộ: 'Đã liên lạc với đồn biên phòng', 'Đang chờ mẫu xét nghiệm'..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-800 placeholder-slate-400 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 shrink-0"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Lưu ghi chú</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT / SIDEBAR COLUMN (5/12) */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. SLA Countdown Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-[#006194]" />
                <span>Tiến Độ & Thời Hạn Cam Kết (SLA)</span>
              </div>

              <div className={`p-4 rounded-xl border text-center ${
                petition.isOverdue 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : petition.status === 4 || petition.status === 6
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-sky-50 border-sky-100 text-sky-900'
              }`}>
                {petition.status === 4 || petition.status === 6 ? (
                  <div className="space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-extrabold text-emerald-800">ĐÃ HOÀN TẤT GIẢI QUYẾT</p>
                    <p className="text-[11px] text-emerald-600">
                      {petition.resolvedAt ? `Giải quyết lúc: ${new Date(petition.resolvedAt).toLocaleDateString('vi-VN')}` : ''}
                    </p>
                  </div>
                ) : petition.isOverdue ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs animate-bounce">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>QUÁ HẠN SLA XỬ LÝ</span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium pt-1">
                      Cần tập trung chỉ đạo giải quyết khẩn cấp cho cơ sở.
                    </p>
                  </div>
                ) : petition.remainingHours !== undefined && petition.remainingHours !== null ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-sky-900">
                      {Math.max(0, Math.round(petition.remainingHours))} giờ
                    </p>
                    <p className="text-xs text-sky-700 font-semibold">Thời gian còn lại đúng hạn</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Chưa thiết lập thời hạn</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn chót giải quyết:</span>
                  <span className="font-bold text-slate-800">
                    {petition.dueDate ? new Date(petition.dueDate).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SLA cam kết danh mục:</span>
                  <span className="font-bold text-slate-800">{petition.defaultSlaHours} giờ</span>
                </div>
              </div>
            </div>

            {/* 2. Đơn vị & Cán bộ phụ trách */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Đơn Vị & Chuyên Viên Thụ Lý</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-500 block">Phòng ban / Chi cục thụ lý:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {petition.departmentName || <span className="text-amber-600 font-semibold">Chưa phân công phòng ban</span>}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Chuyên viên phụ trách:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                      {petition.assignedUserName ? petition.assignedUserName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {petition.assignedUserName ? (
                          petition.assignedUserName
                        ) : petition.status === 2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Chờ Trưởng đơn vị cử cán bộ
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Chưa phân công</span>
                        )}
                      </div>
                      {petition.assignedUserEmail && (
                        <p className="text-[11px] text-slate-400">{petition.assignedUserEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                {canReassign && (
                  <button
                    onClick={() => setIsTransitionOpen(true)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Điều chuyển phòng ban thụ lý
                  </button>
                )}
              </div>
            </div>

            {/* 3. Thông tin Người phản ánh */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Thông Tin Người Phản Ánh</span>
              </div>

              <div className="space-y-2 text-xs">
                {petition.isAnonymous ? (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-[11px]">
                    * Công dân yêu cầu bảo mật danh tính (Ẩn danh khi công khai). Dưới đây là thông tin nội bộ phục vụ xác minh:
                  </div>
                ) : null}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-bold text-slate-900">
                    {petition.citizenName || 'Người dân'}
                  </span>
                </div>

                {petition.citizenPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <a
                      href={`tel:${petition.citizenPhone}`}
                      className="font-bold text-[#006194] hover:underline flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{petition.citizenPhone}</span>
                    </a>
                  </div>
                )}

                {petition.citizenEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thư điện tử:</span>
                    <a
                      href={`mailto:${petition.citizenEmail}`}
                      className="font-semibold text-slate-700 hover:underline truncate max-w-[170px]"
                    >
                      {petition.citizenEmail}
                    </a>
                  </div>
                )}

                {petition.citizenIdCard && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số CCCD:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {petition.citizenIdCard}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Dòng thời gian lịch sử xử lý (Audit Trail Stepper) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Calendar className="w-4 h-4 text-[#006194]" />
                <span>Nhật Ký Luân Chuyển (Audit Trail)</span>
              </div>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {petition.timeline.map((step, idx) => (
                  <div key={step.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#006194] shadow-xs" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {step.action}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(step.createdAt).toLocaleString('vi-VN')} • <strong className="text-slate-600">{step.actorName}</strong>
                      </p>
                      {step.note && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1.5 border border-slate-100">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Workflow Transition Modal */}
      <TransitionStatusModal
        petition={modalPetitionItem}
        isOpen={isTransitionOpen}
        initialStatus={transitionInitialStatus}
        onClose={() => {
          setIsTransitionOpen(false);
          setTransitionInitialStatus(null);
        }}
        onSuccess={() => {
          showToast('Đã cập nhật trạng thái hồ sơ thành công.');
          refetch();
        }}
      />

      {/* 2. Official Resolution Modal */}
      <ResolutionModal
        petitionId={petition.id}
        trackingCode={petition.trackingCode}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        onSuccess={() => {
          showToast('Đã ban hành văn bản kết luận giải quyết thành công.');
          refetch();
        }}
        initialDocumentNumber={petition.resolution?.documentNumber}
        initialConclusionText={petition.resolution?.conclusionText}
        initialConclusionType={
          petition.conclusionType === 1 || petition.conclusionType === 'Valid' || petition.resolution?.conclusionType === 1
            ? 1
            : petition.conclusionType === 2 || petition.conclusionType === 'PartiallyValid' || petition.resolution?.conclusionType === 2
            ? 2
            : petition.conclusionType === 3 || petition.conclusionType === 'InsufficientEvidence' || petition.resolution?.conclusionType === 3
            ? 3
            : 1
        }
        initialPublicSummary={petition.publicSummary || petition.resolution?.publicSummary || ''}
      />

      {/* 3. [Task 4.1] Inspection Note Modal (Biên bản thực địa & GPS) */}
      <AddInspectionNoteModal
        petitionId={petition.id}
        trackingCode={petition.trackingCode}
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          refetch();
        }}
      />

      {/* 4. Media Lightbox */}
      <MediaLightbox
        attachments={petition.attachments}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* 5. [Task 5.1] Review Resolution Modal (Duyệt đóng đơn hoặc Rework) */}
      <ReviewResolutionModal
        petitionId={petition.id}
        trackingCode={petition.trackingCode}
        isOpen={isReviewModalOpen}
        initialMode={reviewModalMode}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          refetch();
        }}
        resolution={petition.resolution}
        conclusionTypeName={petition.conclusionTypeName}
        publicSummary={petition.publicSummary || petition.resolution?.publicSummary}
      />

      {/* 6. [Task-Unit-Workflow] Assign Member Modal (Phân công cán bộ nội bộ) */}
      {petition.departmentId && (
        <AssignMemberModal
          isOpen={isAssignMemberOpen}
          onClose={() => setIsAssignMemberOpen(false)}
          petitionId={petition.id}
          trackingCode={petition.trackingCode}
          departmentId={petition.departmentId}
          departmentName={petition.departmentName || 'Đơn vị xử lý'}
          currentAssignedUserId={petition.assignedUserId}
          onSuccess={(assignedName) => {
            showToast(`Đã phân công cán bộ ${assignedName} thụ lý hồ sơ thành công.`);
            refetch();
          }}
        />
      )}

      {/* 7. [Task-Unit-Workflow] Inspection Report Modal (Nộp & Phê duyệt nghiệm thu) */}
      <InspectionReportModal
        isOpen={isInspectionReportOpen}
        onClose={() => setIsInspectionReportOpen(false)}
        petition={petition}
        mode={inspectionReportMode}
        onSuccess={(msg) => {
          showToast(msg);
          refetch();
        }}
      />
    </div>
  );
};
