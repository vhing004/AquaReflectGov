import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Truy cập bị từ chối</h2>
        <p className="text-sm text-slate-600 mb-6">
          Tài khoản của bạn ({user.roleName}) không có quyền truy cập vào phân hệ này. Vui lòng liên hệ quản trị viên để được phân quyền.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition"
        >
          Quay lại trang chủ
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
