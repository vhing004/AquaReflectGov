import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface CitizenOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Route bảo vệ dành riêng cho Người dân & Khách vãng lai.
 * Cán bộ (SuperAdmin, Dispatcher, Specialist) khi đã đăng nhập
 * sẽ bị chặn và tự động chuyển hướng về Cổng nghiệp vụ (/admin/petitions).
 */
export const CitizenOnlyRoute: React.FC<CitizenOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const isOfficer = isAuthenticated && user && (
    user.role === 'SuperAdmin' || 
    user.role === 'Dispatcher' || 
    user.role === 'Specialist'
  );

  if (isOfficer) {
    return <Navigate to="/admin/petitions" replace />;
  }

  return <>{children}</>;
};

