import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CitizenOnlyRoute } from './components/common/CitizenOnlyRoute';
import { ToastNotificationContainer } from './components/common/ToastNotification';
import { signalRService } from './api/signalrService';
import type { NotificationItem } from './types/notification';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { SubmitPetitionPage } from './pages/SubmitPetitionPage';
import { TrackPetitionPage } from './pages/TrackPetitionPage';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPetitionsPage } from './pages/AdminPetitionsPage';
import { AdminPetitionDetailPage } from './pages/AdminPetitionDetailPage';
import { AdminGisMapPage } from './pages/AdminGisMapPage';
import { UnitDashboardPage } from './pages/admin/UnitDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { PublicResolvedPetitionsPage } from './pages/PublicResolvedPetitionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 phÃºt
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

  // Quáº£n lÃ½ káº¿t ná»‘i thá»i gian thá»±c SignalR cho cÃ¡n bá»™
  useEffect(() => {
    // Káº¿t ná»‘i SignalR cho má»i ngÆ°á»i dÃ¹ng Ä‘Ã£ xÃ¡c thá»±c (CÃ´ng dÃ¢n & CÃ¡n bá»™)

    if (isAuthenticated && user) {
      signalRService.startConnection();

      // Láº¯ng nghe thÃ´ng bÃ¡o má»›i Ä‘á»ƒ hiá»ƒn thá»‹ Toast popup
      const unsubNotification = signalRService.onNotification((item) => {
        setToasts((prev) => [item, ...prev.slice(0, 3)]);

        // Tá»± Ä‘á»™ng táº¯t sau 6 giÃ¢y
        setTimeout(() => {
          dismissToast(item.id);
        }, 6000);
      });

      // Tá»± Ä‘á»™ng lÃ m má»›i danh sÃ¡ch & báº£ng Kanban khi cÃ³ Ä‘Æ¡n má»›i
      const unsubCreated = signalRService.onPetitionCreated(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-petitions'] });
      });

      // Tá»± Ä‘á»™ng lÃ m má»›i khi há»“ sÆ¡ chuyá»ƒn tráº¡ng thÃ¡i hoáº·c káº¿t luáº­n
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
              {/* PhÃ¢n há»‡ NgÆ°á»i dÃ¢n & KhÃ¡ch (CÃ¡n bá»™ bá»‹ cáº¥m truy cáº­p, tá»± Ä‘á»™ng chuyá»ƒn vá» Admin) */}
              <Route path="/" element={<CitizenOnlyRoute><HomePage /></CitizenOnlyRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/categories" element={<CitizenOnlyRoute><CategoriesPage /></CitizenOnlyRoute>} />
              <Route path="/categories/:code" element={<CitizenOnlyRoute><CategoryDetailPage /></CitizenOnlyRoute>} />
              <Route path="/submit" element={<CitizenOnlyRoute><SubmitPetitionPage /></CitizenOnlyRoute>} />
              <Route path="/track" element={<CitizenOnlyRoute><TrackPetitionPage /></CitizenOnlyRoute>} />
              <Route path="/track/:code" element={<CitizenOnlyRoute><TrackPetitionPage /></CitizenOnlyRoute>} />
              <Route path="/resolved" element={<CitizenOnlyRoute><PublicResolvedPetitionsPage /></CitizenOnlyRoute>} />
              <Route path="/map" element={<CitizenOnlyRoute><MapPage /></CitizenOnlyRoute>} />

              {/* Protected Route cho CÃ¡n bá»™ & LÃ£nh Ä‘áº¡o */}
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
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Dispatcher']}>
                    <AdminGisMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/unit-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin', 'Specialist']}>
                    <UnitDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />

          {/* Toast thÃ´ng bÃ¡o thá»i gian thá»±c ná»•i gÃ³c mÃ n hÃ¬nh */}
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
