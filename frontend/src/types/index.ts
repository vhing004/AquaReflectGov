export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export type UserRole = 'SuperAdmin' | 'Dispatcher' | 'Specialist' | 'Citizen';

export type PetitionStatus =
  | 'Submitted'
  | 'Assigned'
  | 'Investigating'
  | 'Resolved'
  | 'Rejected'
  | 'Closed'
  | 'NeedInfo'
  | 'Merged'
  | 'Forwarded'
  | 'Withdrawn';

export type ConclusionType = 'Valid' | 'PartiallyValid' | 'InsufficientEvidence' | 1 | 2 | 3;

export interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  roleName: string;
  departmentId?: string;
  departmentName?: string;
  isUnitLead?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  categoryType: number;
  categoryTypeName: string;
  description?: string;
  defaultSlaHours: number;
  displayOrder: number;
}

export interface AdministrativeUnit {
  id: number;
  code: string;
  name: string;
  englishName?: string;
  level: number;
  parentId?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PetitionAttachment {
  id: string;
  fileName: string;
  originalFileName?: string;
  fileUrl: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  fileSizeBytes?: number;
  fileExtension?: string;
  uploadedAt?: string;
  exifLatitude?: number;
  exifLongitude?: number;
}

export interface CreatePetitionResult {
  id: string;
  trackingCode: string;
  title: string;
  status: number;
  statusName: string;
  priority: number;
  priorityName: string;
  categoryId: string;
  categoryName: string;
  administrativeUnitId?: number;
  createdAt: string;
  dueDate: string;
  defaultSlaHours: number;
  attachments: PetitionAttachment[];
  isAnonymous: boolean;
  message: string;
  /** Mã PIN plain-text — CHỈ có khi isAnonymous=true, chỉ trả về 1 lần duy nhất. */
  accessPin?: string;
}

export interface PetitionTimelineItem {
  id: string;
  createdAt: string;
  action: string;
  fromStatus?: number;
  fromStatusName?: string;
  toStatus: number;
  toStatusName: string;
  note?: string;
  actorName?: string;
}

export interface PetitionResolution {
  id: string;
  conclusionText: string;
  documentNumber?: string;
  officialDocumentUrl?: string;
  issuedAt: string;
  approvedByName?: string;
  conclusionType?: number;
  conclusionTypeName?: string;
  publicSummary?: string;
  isResolvedOnTime?: boolean;
}

export interface PetitionTrackingDetail {
  id: string;
  trackingCode: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  defaultSlaHours: number;
  status: number;
  statusName: string;
  priorityLevel: number;
  priorityName: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  administrativeUnitId?: number;
  administrativeUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  assignedUserName?: string;
  receptionSource?: number;
  receptionSourceName?: string;
  isConflictOfInterest?: boolean;
  isAnonymous: boolean;
  citizenNameMasked?: string;
  citizenPhoneMasked?: string;
  createdAt: string;
  dueDate?: string;
  resolvedAt?: string;
  isOverdue: boolean;
  remainingHours?: number;
  resolutionSummary?: string;
  duplicateOfId?: string;
  duplicateOfTrackingCode?: string;
  forwardToOrganization?: string;
  forwardReason?: string;
  withdrawnReason?: string;
  withdrawnAt?: string;
  needInfoReason?: string;
  needInfoDeadline?: string;
  needInfoCount?: number;
  isSlaPaused?: boolean;
  slaPausedAt?: string;
  totalSlaPausedMinutes?: number;
  conclusionType?: ConclusionType;
  conclusionTypeName?: string;
  publicSummary?: string;
  csatScore?: number;
  canReopen?: boolean;
  reopenCount?: number;
  reopenReason?: string;
  reopenedAt?: string;
  reopenStatus?: number;
  reopenStatusName?: string;
  attachments: PetitionAttachment[];
  timeline: PetitionTimelineItem[];
  resolution?: PetitionResolution;
  hasFeedback: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackAt?: string;
}

export type ReopenStatusType = 'None' | 'Requested' | 'Approved' | 'Rejected';

export interface CsatInfo {
  petitionId: string;
  trackingCode: string;
  score?: number;
  comment?: string;
  feedbackAt?: string;
  hasFeedback: boolean;
  canFeedback: boolean;
  canReopen: boolean;
  reopenStatus: number;
  reopenStatusName: string;
  reopenCount: number;
  reopenReason?: string;
  reopenedAt?: string;
  daysRemainingForFeedback?: number;
}

export interface PetitionSummary {
  id: string;
  trackingCode: string;
  title: string;
  categoryName: string;
  status: number;
  statusName: string;
  priorityLevel: number;
  priorityName: string;
  createdAt: string;
  dueDate?: string;
  isOverdue: boolean;
  attachmentsCount: number;
  departmentName?: string;
}

export interface PublicResolvedPetition {
  id: string;
  trackingCode: string;
  title: string;
  categoryName: string;
  categoryCode: string;
  statusName: string;
  addressText: string;
  administrativeUnitName?: string;
  departmentName?: string;
  createdAt: string;
  resolvedAt?: string;
  defaultSlaHours: number;
  actualProcessingHours?: number;
  slaMarginHours?: number;
  isAheadOfSla: boolean;
  thumbnailUrl?: string;
  resolutionSummary?: string;
  resolutionDocumentNumber?: string;
  hasFeedback: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
}

export interface SubmitFeedbackResult {
  feedbackId: string;
  trackingCode: string;
  rating: number;
  comment?: string;
  feedbackAt: string;
  message: string;
}

export interface WithdrawPetitionResult {
  petitionId: string;
  trackingCode: string;
  previousStatus: string;
  newStatus: string;
  withdrawnAt: string;
  message: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminPetitionItem {
  id: string;
  trackingCode: string;
  title: string;
  categoryName: string;
  categoryCode: string;
  status: number;
  statusName: string;
  priorityLevel: number;
  priorityName: string;
  departmentName?: string;
  departmentId?: string;
  assignedUserName?: string;
  citizenName?: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  addressText: string;
  administrativeUnitName?: string;
  createdAt: string;
  dueDate?: string;
  resolvedAt?: string;
  isOverdue: boolean;
  remainingHours?: number;
  attachmentsCount: number;
  hasFeedback: boolean;
  feedbackRating?: number;
  needInfoCount?: number;
  needInfoDeadline?: string;
  duplicateOfId?: string;
  forwardToOrganization?: string;
}

export interface AdminPetitionFilterParams {
  keyword?: string;
  status?: number;
  priorityLevel?: number;
  departmentId?: string;
  categoryId?: string;
  isOverdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface AllowedTransition {
  status: number;
  statusName: string;
  actionDescription: string;
  requiresDepartment: boolean;
  requiresResolution: boolean;
  requiresReason: boolean;
  requiresNeedInfoReason?: boolean;
  requiresDuplicateTrackingCode?: boolean;
  requiresForwardOrg?: boolean;
}

export interface TransitionStatusRequest {
  toStatus: number;
  departmentId?: string;
  assignedUserId?: string;
  resolutionSummary?: string;
  note?: string;
  duplicateOfTrackingCode?: string;
  duplicateOfId?: string;
  forwardToOrganization?: string;
  forwardReason?: string;
  needInfoReason?: string;
  needInfoDays?: number;
}

export interface TransitionStatusResult {
  petitionId: string;
  trackingCode: string;
  previousStatus: number;
  previousStatusName: string;
  newStatus: number;
  newStatusName: string;
  action: string;
  departmentName?: string;
  assignedUserName?: string;
  resolvedAt?: string;
  message: string;
}

export interface PetitionComment {
  id: string;
  petitionId: string;
  authorName: string;
  authorUserId?: string;
  isInternal: boolean;
  content: string;
  createdAt: string;
}

export interface AdminPetitionDetail {
  id: string;
  trackingCode: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  defaultSlaHours: number;
  status: number;
  statusName: string;
  priorityLevel: number;
  priorityName: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
  administrativeUnitId?: number;
  administrativeUnitName?: string;
  isAnonymous: boolean;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  citizenIdCard?: string;
  departmentId?: string;
  departmentName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserEmail?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  resolvedAt?: string;
  isOverdue: boolean;
  remainingHours?: number;
  resolutionSummary?: string;
  duplicateOfId?: string;
  duplicateOfTrackingCode?: string;
  forwardToOrganization?: string;
  forwardReason?: string;
  withdrawnReason?: string;
  withdrawnAt?: string;
  needInfoReason?: string;
  needInfoDeadline?: string;
  needInfoCount?: number;
  slaPausedAt?: string;
  totalSlaPausedMinutes?: number;
  conclusionType?: ConclusionType;
  conclusionTypeName?: string;
  publicSummary?: string;
  closedAt?: string;
  reworkCount?: number;
  reworkReason?: string;
  csatScore?: number;
  reopenCount?: number;
  reopenReason?: string;
  reopenedAt?: string;
  reopenStatus?: number;
  reopenStatusName?: string;
  attachments: PetitionAttachment[];
  timeline: PetitionTimelineItem[];
  resolution?: PetitionResolution;
  hasFeedback: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackCreatedAt?: string;
  comments: PetitionComment[];
  // Phân quyền nâng cao (RBAC)
  isConflictOfInterest?: boolean;   // Đơn do cán bộ hiện tại gửi (chống xung đột lợi ích)
  receptionSource?: number;         // Nguồn tiếp nhận (0=Online, 1=Phone, 2=InPerson, 3=Document)
  receptionSourceName?: string;
  createdOnBehalfByUserId?: string; // ID cán bộ nhập hộ
  createdOnBehalfByName?: string;   // Tên cán bộ nhập hộ
}

export interface DepartmentOfficer {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId?: string;
  departmentName?: string;
  activeCaseCount: number;
  workloadLevel: 'Low' | 'Medium' | 'High';
  isRecommended: boolean;
  isUnitLead?: boolean; // Cờ trưởng đơn vị
}

export interface SubmitAdditionalInfoResult {
  petitionId: string;
  trackingCode: string;
  previousStatus: number;
  previousStatusName: string;
  newStatus: number;
  newStatusName: string;
  totalSlaPausedMinutes: number;
  newAttachmentsCount: number;
  attachments: PetitionAttachment[];
  message: string;
  submittedAt: string;
}

/** [Task 4.1] Kết quả ghi chú nghiệp vụ hiện trường */
export interface InspectionNoteResult {
  commentId: string;
  petitionId: string;
  trackingCode: string;
  authorName: string;
  noteContent: string;
  noteTypeName: string;
  fieldLatitude?: number;
  fieldLongitude?: number;
  attachmentsAdded: number;
  attachments: PetitionAttachment[];
  createdAt: string;
  message: string;
}





