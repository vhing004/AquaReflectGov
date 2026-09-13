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
  fileExtension: string;
  fileSizeBytes: number;
  fileUrl: string;
  uploadedAt: string;
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
