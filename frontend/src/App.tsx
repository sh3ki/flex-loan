import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/auth.store';
import api from './services/api';
import { queryKeys } from './queries/queryKeys';
import './index.css';

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((mod) => ({ default: mod.DashboardPage })));
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage').then((mod) => ({ default: mod.CalendarPage })));
const CreditorsPage = lazy(() => import('./pages/admin/CreditorsPage').then((mod) => ({ default: mod.CreditorsPage })));
const LoansPage = lazy(() => import('./pages/admin/LoansPage').then((mod) => ({ default: mod.LoansPage })));
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage').then((mod) => ({ default: mod.PaymentsPage })));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage').then((mod) => ({ default: mod.ProfilePage })));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage').then((mod) => ({ default: mod.SystemSettingsPage })));

const preloadAdminPages = () => {
  void import('./pages/admin/DashboardPage');
  void import('./pages/admin/CalendarPage');
  void import('./pages/admin/CreditorsPage');
  void import('./pages/admin/LoansPage');
  void import('./pages/admin/PaymentsPage');
  void import('./pages/admin/ProfilePage');
  void import('./pages/admin/SystemSettingsPage');
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 20 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

function AdminPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-solid border-blue-700 border-r-transparent" />
        <p className="mt-3 text-sm text-slate-600">Loading admin page...</p>
      </div>
    </div>
  );
}

export function App() {
  // Call hooks at component level, not inside callbacks
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Initialize auth store from localStorage if needed
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken && !isAuthenticated) {
      // Token exists but store isn't hydrated, validate the token
      api.get('/api/auth/validate')
        .then((res) => {
          const setAuth = useAuthStore.getState().setAuth;
          setAuth(res.data.user, accessToken);
          preloadAdminPages();
          // Check and create notifications for loan due dates
          api.post('/api/notifications/check').catch((err) => {
            console.error('Failed to check notifications:', err);
          });
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          useAuthStore.getState().logout();
        });
    } else if (accessToken && isAuthenticated) {
      preloadAdminPages();

      // Check and create notifications for loan due dates
      api.post('/api/notifications/check').catch((err) => {
        console.error('Failed to check notifications:', err);
      });

      void queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.summary(),
        queryFn: () => api.get('/api/dashboard/summary').then((res) => res.data),
        staleTime: 30 * 1000,
      });
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <DashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/calendar"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <CalendarPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/creditors"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <CreditorsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/loans"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <LoansPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <PaymentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <SystemSettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageFallback />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
