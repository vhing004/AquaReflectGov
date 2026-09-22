export interface DashboardKpiSummary {
  totalPetitions: number;
  submittedCount: number;
  assignedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  overdueCount: number;
  onTimeResolvedCount: number;
  onTimeRate: number;
  averageResolutionHours: number;
  urgentPendingCount: number;
}

export interface PetitionTrendItem {
  date: string;
  label: string;
  receivedCount: number;
  resolvedCount: number;
}

export interface CategoryStatItem {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  count: number;
  percentage: number;
  overdueCount: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  totalAssigned: number;
  inProgressCount: number;
  resolvedCount: number;
  overdueCount: number;
  onTimeResolvedCount: number;
  onTimeRate: number;
  averageResolutionHours: number;
}

export interface RecentFeedbackItem {
  id: string;
  trackingCode: string;
  petitionTitle: string;
  rating: number;
  comment?: string;
  feedbackAt: string;
}

export interface SatisfactionStat {
  averageRating: number;
  totalFeedbacks: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  satisfactionRate: number;
  recentFeedbacks: RecentFeedbackItem[];
}

export interface DashboardReport {
  kpiSummary: DashboardKpiSummary;
  trendData: PetitionTrendItem[];
  categoryDistribution: CategoryStatItem[];
  departmentPerformance: DepartmentPerformance[];
  satisfaction: SatisfactionStat;
}
