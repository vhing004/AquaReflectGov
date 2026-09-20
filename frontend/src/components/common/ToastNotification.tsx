import React from 'react';
import { 
  FileText, 
  ArrowRightCircle, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle, 
  Bell, 
  X,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types/notification';

interface ToastNotificationProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotificationContainer: React.FC<ToastNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  const navigate = useNavigate();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'NewPetition':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'StatusChanged':
      case 'PetitionAssigned':
        return <ArrowRightCircle className="w-5 h-5 text-amber-500" />;
      case 'ResolutionPublished':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'NewComment':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'SlaWarning':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up hover:shadow-xl transition-all duration-200"
          style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
            {getIcon(item.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {item.title}
              </h4>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {item.content}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">
                {item.timeAgo || 'Vừa xong'}
              </span>

              {item.petitionId && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/admin/petitions/${item.petitionId}`);
                    onDismiss(item.id);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <span>Xem hồ sơ</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
