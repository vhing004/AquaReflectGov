import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ToastNotificationContainer } from './components/common/ToastNotification';
import { signalRService } from './api/signalrService';
import type { NotificationItem } from './types/notification';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SubmitPetitionPage } from './pages/SubmitPetitionPage';
import { TrackPetitionPage } from './pages/TrackPetitionPage';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPetitionsPage } from './pages/AdminPetitionsPage';
import { AdminPetitionDetailPage } from './pages/AdminPetitionDetailPage';
import { AdminGisMapPage } from './pages/AdminGisMapPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 phút
    },
  },
});

export const App: React.FC = () => {
  const { initialize, isAuthenticated, user } = useAuthStore();
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Quản lý kết nối thời gian thực SignalR cho cán bộ
  useEffect(() => {
    const isOfficer = user && (user.roleName === 'SuperAdmin' || user.roleName === 'Dispatcher' || user.roleName === 'Specialist');

    if (isAuthenticated && isOfficer) {
      signalRService.startConnection();

      // Lắng nghe thông báo mới để hiển thị Toast popup
      const unsubNotification = signalRService.onNotification((item) => {
        setToasts((prev) => [item, ...prev.slice(0, 3)]);

        // Tự động tắt sau 6 giây
        setTimeout(() => {
          dismissToast(item.id);
        }, 6000);
      });

      // Tự động làm mới danh sách & bảng Kanban khi có đơn mới
      const unsubCreated = signalRService.onPetitionCreated(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-petitions'] });
      });

      // Tự động làm mới khi hồ sơ chuyển trạng thái hoặc kết luận
      const unsubStatus = signalRService.onPetitionStatusChanged(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-petitions'] });
        queryClient.invalidateQueries({ queryKey: ['admin-petition-detail'] });
      });

      const unsubResolved = signalRService.onPetitionResolved(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-petitions'] });
        queryClient.invalidateQueries({ queryKey: ['admin-petition-detail'] });
      });

      const unsubComment = signalRService.onNewCommentAdded(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-petition-detail'] });
      });

      return () => {
        unsubNotification();
        unsubCreated();
        unsubStatus();
        unsubResolved();
        unsubComment();
        signalRService.stopConnection();
      };
    } else {
      signalRService.stopConnection();
    }
  }, [isAuthenticated, user, dismissToast]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/submit" element={<SubmitPetitionPage />} />
              <Route path="/track" element={<TrackPetitionPage />} />
              <Route path="/map" element={<MapPage />} />

              {/* Protected Route cho Cán bộ & Lãnh đạo */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Dispatcher', 'Specialist']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/petitions"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Dispatcher', 'Specialist']}>
                    <AdminPetitionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/petitions/:id"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Dispatcher', 'Specialist']}>
                    <AdminPetitionDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gis-map"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Dispatcher', 'Specialist']}>
                    <AdminGisMapPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />

          {/* Toast thông báo thời gian thực nổi góc màn hình */}
          <ToastNotificationContainer
            notifications={toasts}
            onDismiss={dismissToast}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
