import React from 'react';
import type { AdminPetitionItem } from '../../types';
import {
  Inbox,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { KanbanCard } from './KanbanCard';

interface KanbanColumn {
  statusCode: number;
  label: string;
  icon: React.ReactNode;
  colorTheme: {
    header: string;
    countBadge: string;
    emptyIcon: string;
    border: string;
    bg: string;
  };
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    statusCode: 1,
    label: 'Mới tiếp nhận',
    icon: <Inbox className="w-4 h-4" />,
    colorTheme: {
      header: 'text-sky-800 bg-sky-50 border-sky-200',
      countBadge: 'bg-sky-600 text-white',
      emptyIcon: 'text-sky-200',
      border: 'border-sky-200',
      bg: 'bg-sky-50/30',
    },
  },
  {
    statusCode: 2,
    label: 'Đã phân công',
    icon: <Layers className="w-4 h-4" />,
    colorTheme: {
      header: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      countBadge: 'bg-indigo-600 text-white',
      emptyIcon: 'text-indigo-200',
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/20',
    },
  },
  {
    statusCode: 3,
    label: 'Đang xử lý',
    icon: <Clock className="w-4 h-4" />,
    colorTheme: {
      header: 'text-amber-800 bg-amber-50 border-amber-200',
      countBadge: 'bg-amber-600 text-white',
      emptyIcon: 'text-amber-200',
      border: 'border-amber-200',
      bg: 'bg-amber-50/20',
    },
  },
  {
    statusCode: 4,
    label: 'Đã giải quyết',
    icon: <CheckCircle2 className="w-4 h-4" />,
    colorTheme: {
      header: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      countBadge: 'bg-emerald-600 text-white',
      emptyIcon: 'text-emerald-200',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/20',
    },
  },
];

// Loading skeleton for a single card
const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2.5 animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 bg-slate-200 rounded w-24" />
      <div className="h-4 bg-slate-100 rounded w-16" />
    </div>
    <div className="h-3.5 bg-slate-200 rounded w-full" />
    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
    <div className="h-3 bg-slate-100 rounded w-1/2" />
    <div className="border-t border-slate-100" />
    <div className="flex justify-between">
      <div className="h-3 bg-slate-100 rounded w-20" />
      <div className="h-6 bg-slate-100 rounded w-16" />
    </div>
  </div>
);

interface KanbanBoardProps {
  petitions: AdminPetitionItem[];
  isLoading: boolean;
  isFetching: boolean;
  onTransition: (item: AdminPetitionItem) => void;
  onViewDetail: (item: AdminPetitionItem) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  petitions,
  isLoading,
  isFetching,
  onTransition,
  onViewDetail,
}) => {
  // Group petitions by status
  const grouped = React.useMemo(() => {
    const map: Record<number, AdminPetitionItem[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const p of petitions) {
      if (p.status in map) {
        map[p.status].push(p);
      }
    }
    return map;
  }, [petitions]);

  // Count overdue per column
  const overdueCount = React.useMemo(() => {
    const map: Record<number, number> = {};
    for (const [status, items] of Object.entries(grouped)) {
      map[Number(status)] = items.filter((i) => i.isOverdue).length;
    }
    return map;
  }, [grouped]);

  return (
    <div className="relative">
      {/* Fetching overlay indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-200 text-xs text-sky-700 font-semibold">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Đang cập nhật...
        </div>
      )}

      {/* Kanban grid — horizontal scroll on small screens */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[60vh]"
           style={{ scrollSnapType: 'x mandatory' }}>
        {KANBAN_COLUMNS.map((col) => {
          const colItems = grouped[col.statusCode] || [];
          const colOverdue = overdueCount[col.statusCode] || 0;

          return (
            <div
              key={col.statusCode}
              className="flex-shrink-0 w-72 sm:w-80 flex flex-col"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border ${col.colorTheme.header} mb-3`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {col.icon}
                  <span>{col.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {colOverdue > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {colOverdue} QH
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.colorTheme.countBadge}`}>
                    {isLoading ? '…' : colItems.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className={`flex-1 rounded-2xl border-2 ${col.colorTheme.border} ${col.colorTheme.bg} p-2 space-y-2.5 overflow-y-auto`}
                   style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '400px' }}>
                {isLoading ? (
                  // Loading skeleton — show 3 placeholder cards
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                ) : colItems.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className={`opacity-30 mb-2 ${col.colorTheme.emptyIcon}`}>
                      {col.icon}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Không có hồ sơ</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">trong trạng thái này</p>
                  </div>
                ) : (
                  // Sort: overdue first, then by priority desc, then by createdAt
                  [...colItems]
                    .sort((a, b) => {
                      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
                      if (b.priorityLevel !== a.priorityLevel) return b.priorityLevel - a.priorityLevel;
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    })
                    .map((item) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        onTransition={onTransition}
                        onViewDetail={onViewDetail}
                      />
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile scroll hint */}
      <p className="text-center text-[11px] text-slate-400 mt-1 sm:hidden">
        ← Vuốt ngang để xem thêm cột →
      </p>
    </div>
  );
};
