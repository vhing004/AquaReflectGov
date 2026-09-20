import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  FileText, 
  ArrowRightCircle, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { signalRService } from '../../api/signalrService';
import type { NotificationItem } from '../../types/notification';

interface NotificationBellProps {
  onNewToast?: (notification: NotificationItem) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNewToast }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Tải danh sách thông báo ban đầu
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications({ pageIndex: 1, pageSize: 15 });
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thông báo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Lắng nghe thông báo thời gian thực qua SignalR
    const unsubscribe = signalRService.onNotification((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((count) => count + 1);

      // Hiệu ứng rung chuông nhẹ
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1200);

      // Gọi callback hiển thị toast nếu có
      if (onNewToast) {
        onNewToast(newNotification);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onNewToast]);

  // Đóng popover khi nhấp chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (error) {
        console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      }
    }

    setIsOpen(false);

    if (item.petitionId) {
      navigate(`/admin/petitions/${item.petitionId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NewPetition':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'StatusChanged':
      case 'PetitionAssigned':
        return <ArrowRightCircle className="w-4 h-4 text-amber-500" />;
      case 'ResolutionPublished':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'NewComment':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'SlaWarning':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Nút Chuông Thông Báo */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${
          isRinging ? 'animate-bounce text-cyan-600' : ''
        }`}
        title="Thông báo hệ thống"
      >
        <Bell className="w-5 h-5" />

        {/* Badge số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Thông Báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in">
          {/* Header Popover */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Danh sách Thông báo */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !item.isRead ? 'bg-cyan-50/40 dark:bg-cyan-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-medium truncate ${!item.isRead ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                      <span>{item.timeAgo}</span>
                      {item.trackingCode && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                          {item.trackingCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Popover */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/petitions');
              }}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Xem tất cả phản ánh cần xử lý
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
