import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X, Star, MapPin, Clock, CheckCircle2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { usersApi } from '../../api/usersApi';
import type { UserListItem, UserPetitionItem } from '../../types';

interface OfficerPetitionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserListItem | null;
}

// Badge mau trang thai
const StatusBadge: React.FC<{ statusName: string; status: number }> = ({ statusName, status }) => {
  const colors: Record<number, string> = {
    4: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    6: 'bg-slate-100 text-slate-700 border-slate-200',
    3: 'bg-sky-100 text-sky-800 border-sky-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    11: 'bg-amber-100 text-amber-800 border-amber-200',
    5: 'bg-red-100 text-red-800 border-red-200',
  };
  const cls = colors[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {statusName}
    </span>
  );
};

// Stars danh gia CSAT
const RatingStars: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return <span className="text-xs text-slate-400">Chua danh gia</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1">({rating}/5)</span>
    </span>
  );
};

// The phieu ho so
const PetitionCard: React.FC<{ item: UserPetitionItem }> = ({ item }) => {
  const createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');
  const resolvedDate = item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('vi-VN') : null;

  return (
    <Link
      to={`/admin/petitions/${item.id}`}
      className="group block bg-white rounded-xl border border-slate-200 p-4 hover:border-[#006194] hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold text-[#006194] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
            #{item.trackingCode}
          </span>
          {item.isOverdue && (
            <span className="flex items-center gap-0.5 text-xs text-red-600 font-medium">
              <AlertTriangle className="w-3 h-3" /> Qua han
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#006194] transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">{item.title}</h4>

      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="line-clamp-1">{item.addressText}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <StatusBadge statusName={item.statusName} status={item.status} />
        <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
          {item.categoryName}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          item.priorityLevel === 3 ? 'text-red-700 bg-red-50 border border-red-200'
          : item.priorityLevel === 2 ? 'text-orange-700 bg-orange-50 border border-orange-200'
          : 'text-slate-600 bg-slate-50 border border-slate-200'
        }`}>
          {item.priorityName}
        </span>
      </div>

      {item.resolutionSummary && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-2 bg-slate-50 rounded-lg px-3 py-2 border-l-2 border-[#006194]">
          {item.resolutionSummary}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {createdDate}
          </span>
          {resolvedDate && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> {resolvedDate}
            </span>
          )}
        </div>
        {item.feedbackRating != null && <RatingStars rating={item.feedbackRating} />}
      </div>
    </Link>
  );
};

export const OfficerPetitionsDrawer: React.FC<OfficerPetitionsDrawerProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'resolved' | 'active'>('resolved');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['user-petitions', user?.id, activeTab, page],
    queryFn: async () => {
      if (!user) return null;
      const res = await usersApi.getUserPetitions(user.id, {
        filterType: activeTab,
        pageNumber: page,
        pageSize: 8,
      });
      return res.data;
    },
    enabled: isOpen && !!user,
  });

  const petitions: UserPetitionItem[] = (data as any)?.data?.items ?? [];
  const totalCount: number = (data as any)?.data?.totalCount ?? 0;
  const totalPages: number = (data as any)?.data?.totalPages ?? 1;

  // Reset khi doi tab
  const handleTabChange = (tab: 'resolved' | 'active') => {
    setActiveTab(tab);
    setPage(1);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-50 shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006194] to-[#0284c7] text-white px-6 py-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-sm font-bold">
              {user ? getInitials(user.fullName) : '?'}
            </div>
            <div>
              <h2 className="font-semibold text-base">{user?.fullName}</h2>
              <p className="text-sky-200 text-xs">{user?.roleName} {user?.departmentName ? `• ${user.departmentName}` : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-6 shrink-0">
          <div className="text-center">
            <div className="text-lg font-bold text-[#006194]">{user?.resolvedCaseCount ?? 0}</div>
            <div className="text-xs text-slate-500">Da xu ly</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{user?.activeCaseCount ?? 0}</div>
            <div className="text-xs text-slate-500">Dang xu ly</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-700">
              {user ? (user.resolvedCaseCount + user.activeCaseCount) : 0}
            </div>
            <div className="text-xs text-slate-500">Tong so</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 shrink-0">
          <div className="flex gap-0">
            {([
              { key: 'resolved', label: 'Ho so da xu ly' },
              { key: 'active', label: 'Ho so dang xu ly' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#006194] text-[#006194]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : petitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">Chua co ho so nao</p>
              <p className="text-sm mt-1">
                {activeTab === 'resolved' ? 'Can bo nay chua xu ly ho so nao' : 'Khong co ho so dang xu ly'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-medium">
                Tim thay {totalCount} ho so
              </p>
              {petitions.map((item) => (
                <PetitionCard key={item.id} item={item} />
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Truoc
            </button>
            <span className="text-xs text-slate-500">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </>
  );
};

