import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  ShieldAlert, 
  Loader2,
  Network,
  Users
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { signalRService } from '../../api/signalrService';
import { useAuthStore } from '../../store/useAuthStore';
import type { PetitionComment, UserInfo } from '../../types';

interface InternalThreadPanelProps {
  petitionId: string;
  trackingCode?: string;
  departmentName?: string;
  currentUser?: UserInfo | null;
  initialComments?: PetitionComment[];
}

export const InternalThreadPanel: React.FC<InternalThreadPanelProps> = ({
  petitionId,
  trackingCode = '',
  departmentName = 'Đơn vị chuyên trách',
  currentUser,
  initialComments = [],
}) => {
  const { user } = useAuthStore();
  const activeUser = currentUser || user;
  const [comments, setComments] = useState<PetitionComment[]>(
    initialComments.filter(c => c.isInternal)
  );
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Phân quyền kênh chat theo Yêu cầu 1:
  // - Kênh chung điều phối: chỉ dành cho Trưởng phòng/Trưởng đơn vị (isUnitLead), Cán bộ tiếp nhận (Dispatcher), và Admin (SuperAdmin).
  // - Chuyên viên xử lý (!isUnitLead): chỉ có quyền trong Kênh trao đổi nội bộ đơn vị.
  const canAccessCoordination = activeUser?.role === 'SuperAdmin' || 
    activeUser?.role === 'Dispatcher' || 
    (activeUser?.role === 'Specialist' && activeUser?.isUnitLead);

  const [activeChannel, setActiveChannel] = useState<'unit' | 'coordination'>('unit');

  // Tải danh sách comment ban đầu nếu chưa có
  useEffect(() => {
    loadThread();
  }, [petitionId]);

  // Lắng nghe SignalR cho tin nhắn mới
  useEffect(() => {
    const handleNewComment = (data: unknown) => {
      const payload = data as { petitionId?: string; data?: { petitionId?: string } } | undefined;
      const targetId = payload?.petitionId || payload?.data?.petitionId;
      if (!targetId || targetId === petitionId) {
        loadThread();
      }
    };

    const unsubComment = signalRService.onNewCommentAdded(handleNewComment);
    const unsubNotif = signalRService.onNotification((notif) => {
      if (notif.petitionId === petitionId) {
        loadThread();
      }
    });

    return () => {
      unsubComment();
      unsubNotif();
    };
  }, [petitionId]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments, activeChannel]);

  const loadThread = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getInternalThread(petitionId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch {
      // Fallback giữ initialComments
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    setErrorMessage(null);

    // Nếu đang ở kênh điều phối chung, thêm tiền tố nhận diện
    const formattedContent = activeChannel === 'coordination' 
      ? `[ĐIỀU PHỐI CHUNG] ${content.trim()}`
      : content.trim();

    try {
      const res = await adminApi.addComment(petitionId, formattedContent);
      if (res.success && res.data) {
        setComments(prev => [...prev, res.data]);
        setContent('');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || 'Không thể gửi tin nhắn trao đổi.');
    } finally {
      setIsSending(false);
    }
  };

  // Phân tách tin nhắn theo kênh
  const isCoordinationMessage = (comment: PetitionComment) => {
    return comment.content.startsWith('[ĐIỀU PHỐI CHUNG]') || 
      comment.authorRoleName?.includes('Điều phối') ||
      comment.authorRoleName?.includes('Quản trị viên');
  };

  const unitComments = comments.filter(c => !isCoordinationMessage(c));
  const coordComments = comments.filter(c => isCoordinationMessage(c));

  const currentDisplayComments = activeChannel === 'unit' ? unitComments : coordComments;

  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-violet-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[540px] overflow-hidden">
      {/* Header & Channel Selector */}
      <div className="bg-slate-50/90 border-b border-slate-200">
        {/* Channel Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveChannel('unit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'unit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Nội Bộ Đơn Vị ({departmentName})</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeChannel === 'unit' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {unitComments.length}
              </span>
            </button>

            {canAccessCoordination && (
              <button
                type="button"
                onClick={() => setActiveChannel('coordination')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeChannel === 'coordination'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Kênh Điều Phối Chung (Cấp Phòng)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeChannel === 'coordination' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {coordComments.length}
                </span>
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time SignalR
          </div>
        </div>

        {/* Channel Description Banner */}
        <div className="px-4 py-2 bg-slate-100/60 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            {activeChannel === 'unit' ? (
              <>🏢 Kênh riêng của <strong>{departmentName}</strong>: Trưởng đơn vị và các thành viên trao đổi nghiệp vụ để giải quyết hồ sơ.</>
            ) : (
              <>🌐 Kênh điều phối chung: Nơi các <strong>Trưởng phòng đơn vị</strong> giao tiếp, báo cáo với <strong>Cán bộ tiếp nhận</strong> và <strong>Admin</strong>.</>
            )}
          </span>
          <span className="font-semibold text-slate-600">Mã HS: {trackingCode}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
        {isLoading && currentDisplayComments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm">Đang tải trao đổi nội bộ...</span>
          </div>
        ) : currentDisplayComments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {activeChannel === 'unit' ? 'Chưa có trao đổi nội bộ đơn vị nào' : 'Chưa có trao đổi điều phối chung nào'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {activeChannel === 'unit' 
                ? 'Trưởng đơn vị và các thành viên trong đơn vị có thể nhắn tin chỉ đạo, cập nhật tiến độ kiểm tra thực địa hoặc phối hợp xử lý tại đây.'
                : 'Trưởng các phòng ban giao tiếp với Cán bộ tiếp nhận (Điều phối) và Quản trị viên tại đây.'}
            </p>
          </div>
        ) : (
          currentDisplayComments.map((comment) => {
            const isMe = activeUser && (
              (comment.authorUserId && comment.authorUserId === activeUser.id) ||
              (comment.authorUsername && comment.authorUsername.toLowerCase() === (activeUser.username || activeUser.email || '').toLowerCase())
            );

            // Xóa prefix [ĐIỀU PHỐI CHUNG] khi hiển thị cho đẹp
            const cleanContent = comment.content.replace(/^\[ĐIỀU PHỐI CHUNG\]\s*/, '');

            return (
              <div 
                key={comment.id}
                className={`flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 rounded-full ${getAvatarBg(comment.authorName)} text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm`}
                  title={comment.authorName}
                >
                  {getInitials(comment.authorName)}
                </div>

                {/* Bubble content */}
                <div>
                  <div className={`flex items-center gap-1.5 mb-1 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-700">
                      {isMe ? 'Bạn' : comment.authorName}
                    </span>
                    {comment.authorIsUnitLead && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        Trưởng đơn vị
                      </span>
                    )}
                    {comment.authorRoleName && !comment.authorIsUnitLead && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {comment.authorRoleName}
                      </span>
                    )}
                    <span className="text-slate-400">
                      • {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                    isMe 
                      ? (activeChannel === 'coordination' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-blue-600 text-white rounded-tr-none')
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}>
                    {cleanContent}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
        {errorMessage && (
          <div className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              activeChannel === 'unit'
                ? `Nhắn tin nội bộ ${departmentName} về hồ sơ ${trackingCode}...`
                : `Báo cáo / trao đổi với Cán bộ tiếp nhận & Quản trị viên...`
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className={`px-4 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer ${
              activeChannel === 'coordination'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
