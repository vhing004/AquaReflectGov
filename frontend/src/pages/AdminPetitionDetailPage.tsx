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
  Loader2
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { TransitionStatusModal } from '../components/admin/TransitionStatusModal';
import { ResolutionModal } from '../components/admin/ResolutionModal';
import { MediaLightbox } from '../components/admin/MediaLightbox';
import { MiniMapViewer } from '../components/admin/MiniMapViewer';
import type { AdminPetitionItem } from '../types';

export const AdminPetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Modals & Lightbox states
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
                title="In phiếu hồ sơ khổ A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">In hồ sơ</span>
              </button>
              <button
                onClick={() => setIsTransitionOpen(true)}
                disabled={petition.status === 6}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#006194] hover:bg-sky-50 text-xs font-bold transition-all shadow-sm disabled:opacity-40"
              >
                <Layers className="w-3.5 h-3.5 text-[#006194]" />
                <span>Luân chuyển trạng thái</span>
              </button>
              {petition.status !== 4 && petition.status !== 6 && (
                <button
                  onClick={() => setIsResolutionOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Ban hành kết luận</span>
                </button>
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

      {/* 2. MAIN BODY: 2-COLUMN DOSSIER LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT / MAIN DOSSIER COLUMN (7/12) */}
          <div className="lg:col-span-8 space-y-6">

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

            {/* D. Khối Kết Luận Giải Quyết Chính Thức (Official Resolution) */}
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

                {petition.resolution && (
                  <button
                    onClick={() => setIsResolutionOpen(true)}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900"
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
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                        {petition.resolution.documentNumber || 'VĂN BẢN KẾT LUẬN CHÍNH THỨC'}
                      </span>
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
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-slate-50/50 space-y-3">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Chưa ban hành văn bản kết luận giải quyết</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sau khi thẩm tra thực địa và phối hợp liên ngành, cán bộ ban hành quyết định kết luận tại đây.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsResolutionOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Ban hành kết luận ngay</span>
                  </button>
                </div>
              )}
            </div>

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
              </div>
            )}

            {/* F. Sổ tay Cán bộ & Trao đổi Nghiệp vụ Nội bộ */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#006194]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Sổ Tay Nghiệp Vụ & Trao Đổi Nội Bộ ({petition.comments.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Ghi chú điều phối, kết quả liên lạc với cơ sở hoặc chỉ đạo nội bộ (Chỉ cán bộ thấy)
                  </p>
                </div>
              </div>

              {/* Comments stream */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {petition.comments.length > 0 ? (
                  petition.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 flex items-center space-x-1">
                          <User className="w-3 h-3 text-[#006194]" />
                          <span>{cmt.authorName}</span>
                        </span>
                        <span className="text-slate-400">
                          {new Date(cmt.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{cmt.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Chưa có ghi chú nội bộ nào. Thêm ghi chú đầu tiên bên dưới.
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
                      <p className="font-bold text-slate-900">
                        {petition.assignedUserName || <span className="text-slate-400 font-normal">Chưa phân công</span>}
                      </p>
                      {petition.assignedUserEmail && (
                        <p className="text-[11px] text-slate-400">{petition.assignedUserEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsTransitionOpen(true)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Điều chuyển phòng ban / Chuyên viên
                </button>
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
        onClose={() => setIsTransitionOpen(false)}
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
      />

      {/* 3. Media Lightbox */}
      <MediaLightbox
        attachments={petition.attachments}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};
