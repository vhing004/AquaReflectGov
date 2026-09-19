import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SubmitPetitionPage } from './pages/SubmitPetitionPage';
import { TrackPetitionPage } from './pages/TrackPetitionPage';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPetitionsPage } from './pages/AdminPetitionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 phút
    },
  },
});

export const App: React.FC = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
