export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export type UserRole = 'SuperAdmin' | 'Dispatcher' | 'Specialist' | 'Citizen';

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
  isAnonymous: boolean;
  citizenNameMasked?: string;
  citizenPhoneMasked?: string;
  createdAt: string;
  dueDate?: string;
  resolvedAt?: string;
  isOverdue: boolean;
  remainingHours?: number;
  resolutionSummary?: string;
  attachments: PetitionAttachment[];
  timeline: PetitionTimelineItem[];
  resolution?: PetitionResolution;
  hasFeedback: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
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

export interface SubmitFeedbackResult {
  feedbackId: string;
  trackingCode: string;
  rating: number;
  comment?: string;
  feedbackAt: string;
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
}

export interface TransitionStatusRequest {
  toStatus: number;
  departmentId?: string;
  assignedUserId?: string;
  resolutionSummary?: string;
  note?: string;
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
  attachments: PetitionAttachment[];
  timeline: PetitionTimelineItem[];
  resolution?: PetitionResolution;
  hasFeedback: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackCreatedAt?: string;
  comments: PetitionComment[];
}



