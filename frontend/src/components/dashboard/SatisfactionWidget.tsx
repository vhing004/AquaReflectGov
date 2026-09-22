import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import type { SatisfactionStat } from '../../types/dashboard';

interface SatisfactionWidgetProps {
  data: SatisfactionStat;
}

export const SatisfactionWidget: React.FC<SatisfactionWidgetProps> = ({ data }) => {
  const ratingDistribution = [
    { stars: 5, label: '5 sao - Rất hài lòng', count: data.fiveStarCount, color: 'bg-emerald-500' },
    { stars: 4, label: '4 sao - Hài lòng', count: data.fourStarCount, color: 'bg-sky-500' },
    { stars: 3, label: '3 sao - Bình thường', count: data.threeStarCount, color: 'bg-amber-400' },
    { stars: 2, label: '2 sao - Chưa hài lòng', count: data.twoStarCount, color: 'bg-orange-500' },
    { stars: 1, label: '1 sao - Rất kém', count: data.oneStarCount, color: 'bg-rose-500' },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Chỉ Số Đánh Giá Hài Lòng Công Dân (CSAT)
            </h3>
            <p className="text-[11px] text-slate-500">
              Phản hồi trực tiếp từ ngư dân và nhân dân sau khi tiếp nhận văn bản kết luận
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
          {data.totalFeedbacks} Lượt đánh giá
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Score Summary Box (4 COLS) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 rounded-2xl border border-amber-200/70 text-center space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Điểm Đánh Giá Trung Bình
          </span>
          <div className="text-5xl font-black text-amber-500 tracking-tight">
            {data.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center text-amber-400 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(data.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-lg inline-block">
            {data.satisfactionRate}% công dân hài lòng
          </p>
        </div>

        {/* Star Rating Distribution Bars (8 COLS) */}
        <div className="lg:col-span-8 space-y-2">
          {ratingDistribution.map((item) => {
            const pct = data.totalFeedbacks > 0 ? Math.round((item.count / data.totalFeedbacks) * 100) : 0;
            return (
              <div key={item.stars} className="flex items-center space-x-3 text-xs">
                <span className="w-28 text-slate-600 truncate text-[11px] font-medium" title={item.label}>
                  {item.label}
                </span>
                <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-[11px] text-slate-800 font-bold">
                  {item.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Feedbacks Comments */}
      {data.recentFeedbacks && data.recentFeedbacks.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-700 block uppercase">
            Ý kiến đánh giá gần đây của nhân dân
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recentFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#006194] text-[11px]">
                    {fb.trackingCode}
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-semibold text-slate-800 line-clamp-1">{fb.petitionTitle}</p>
                {fb.comment && (
                  <p className="text-slate-600 italic text-[11px] leading-relaxed bg-white p-2 rounded-xl border border-slate-100">
                    "{fb.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
