export type NotificationType =
  | 'System'
  | 'NewPetition'
  | 'PetitionAssigned'
  | 'StatusChanged'
  | 'ResolutionPublished'
  | 'NewComment'
  | 'SlaWarning';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: NotificationType | string;
  petitionId?: string;
  trackingCode?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
