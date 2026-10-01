import type { UserRole, PetitionStatus } from '../types';

/**
 * Định nghĩa danh sách các vai trò được phép cho từng tính năng / khu vực trong hệ thống
 */
export const PERMISSIONS = {
  // === TRANG & MENU ===
  DASHBOARD_FULL: ['SuperAdmin', 'Dispatcher'] as UserRole[],
  DASHBOARD_ANY: ['SuperAdmin', 'Dispatcher', 'Specialist'] as UserRole[],
  GIS_COMMAND_CENTER: ['SuperAdmin', 'Dispatcher'] as UserRole[],
  PETITIONS_ADMIN: ['SuperAdmin', 'Dispatcher', 'Specialist'] as UserRole[],
  NOTIFICATIONS: ['SuperAdmin', 'Dispatcher', 'Specialist'] as UserRole[],

  // === LUỒNG TRẠNG THÁI (STATE MACHINE ACTIONS) ===
  // Gán xử lý / Phân công
  TRANSITION_ASSIGN: ['SuperAdmin', 'Dispatcher'] as UserRole[],
  // Bắt đầu thẩm tra / thụ lý
  TRANSITION_INVESTIGATE: ['SuperAdmin', 'Specialist'] as UserRole[],
  // Ban hành kết luận xử lý
  TRANSITION_RESOLVE: ['SuperAdmin', 'Specialist'] as UserRole[],
  // Từ chối thụ lý hồ sơ
  TRANSITION_REJECT: ['SuperAdmin', 'Dispatcher'] as UserRole[],
  // Đóng hồ sơ lưu trữ
  TRANSITION_CLOSE: ['SuperAdmin', 'Dispatcher'] as UserRole[],

  // === THAO TÁC HỒ SƠ CHI TIẾT ===
  // Ban hành văn bản kết luận giải quyết
  ISSUE_RESOLUTION: ['SuperAdmin', 'Specialist'] as UserRole[],
  // Thêm ghi chú nội bộ
  ADD_INTERNAL_NOTE: ['SuperAdmin', 'Dispatcher', 'Specialist'] as UserRole[],

  // === BÁO CÁO & XUẤT DỮ LIỆU ===
  // Xuất báo cáo toàn hệ thống (không lọc phòng ban)
  EXPORT_ALL_DATA: ['SuperAdmin', 'Dispatcher'] as UserRole[],
  // Xuất báo cáo phạm vi phòng ban
  EXPORT_DEPT_DATA: ['SuperAdmin', 'Dispatcher', 'Specialist'] as UserRole[],

  // === TÍNH NĂNG GIS NÂNG CAO ===
  GIS_SPATIAL_TOOLS: ['SuperAdmin', 'Dispatcher'] as UserRole[],

  // === QUẢN TRỊ HỆ THỐNG ===
  MANAGE_SYSTEM_USERS: ['SuperAdmin'] as UserRole[],
  MANAGE_DEPARTMENTS: ['SuperAdmin'] as UserRole[],
};

/**
 * Kiểm tra xem vai trò hiện tại có thuộc danh sách vai trò cho phép không
 */
export function hasRole(currentRole: UserRole | undefined | null, allowedRoles: UserRole[]): boolean {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}

/**
 * Kiểm tra xem cán bộ có quyền xem hoặc thao tác trên hồ sơ này không
 * - SuperAdmin, Dispatcher: Thao tác mọi hồ sơ
 * - Specialist: Chỉ thao tác nếu hồ sơ thuộc phòng ban của mình
 */
export function canAccessPetition(
  userRole: UserRole | undefined | null,
  userDepartmentId: string | undefined | null,
  petitionDepartmentId: string | undefined | null
): boolean {
  if (!userRole) return false;
  if (userRole === 'SuperAdmin' || userRole === 'Dispatcher') return true;
  if (userRole === 'Specialist') {
    if (!userDepartmentId || !petitionDepartmentId) return false;
    return userDepartmentId.toLowerCase() === petitionDepartmentId.toLowerCase();
  }
  return false;
}

/**
 * Kiểm tra quyền thực hiện bước chuyển trạng thái tuần tự
 */
export function canExecuteTransition(
  userRole: UserRole | undefined | null,
  targetStatus: PetitionStatus,
  isSameDepartment: boolean = true
): boolean {
  if (!userRole) return false;

  switch (targetStatus) {
    case 'Assigned':
      return hasRole(userRole, PERMISSIONS.TRANSITION_ASSIGN);

    case 'Investigating':
      return hasRole(userRole, PERMISSIONS.TRANSITION_INVESTIGATE) && (userRole === 'SuperAdmin' || isSameDepartment);

    case 'Resolved':
      return hasRole(userRole, PERMISSIONS.TRANSITION_RESOLVE) && (userRole === 'SuperAdmin' || isSameDepartment);

    case 'Rejected':
      return hasRole(userRole, PERMISSIONS.TRANSITION_REJECT);

    case 'Closed':
      return hasRole(userRole, PERMISSIONS.TRANSITION_CLOSE);

    default:
      return false;
  }
}
