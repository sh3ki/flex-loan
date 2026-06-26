import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useLogoutMutation } from '../../queries/auth.queries';
import { useCheckNotificationsMutation } from '../../queries/notification.queries';
import { NotificationBell } from './NotificationBell';
import { NotificationModal } from '../common/NotificationModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const logoutMutation = useLogoutMutation();
  const checkNotificationsMutation = useCheckNotificationsMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('accessToken');
    if (!isAuthenticated || !hasToken) {
      return;
    }

    checkNotificationsMutation.mutate(undefined, {
      onError: (error) => {
        console.error('Notification check failed:', error);
      },
    });
  }, [location.pathname, isAuthenticated]);

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Calendar', href: '/admin/calendar', icon: <CalendarIcon /> },
    { label: 'Borrowers', href: '/admin/creditors', icon: <UsersIcon /> },
    { label: 'Loans', href: '/admin/loans', icon: <LoanIcon /> },
    { label: 'Payments', href: '/admin/payments', icon: <PaymentIcon /> },
    { label: 'System Settings', href: '/admin/settings', icon: <SettingsIcon /> },
    { label: 'Profile', href: '/admin/profile', icon: <ProfileIcon /> },
  ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem('accessToken');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {isSidebarOpen && (
          <button
            aria-label="Close sidebar"
            className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">MFLEX</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">Operations Portal</h1>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-6">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onNavigate={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <button
                onClick={() => setIsLogoutConfirmationOpen(true)}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen((current) => !current)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <MenuIcon />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Loan Management</p>
                  <h2 className="text-lg font-semibold text-slate-900">Lending Workspace</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell onBellClick={() => setIsNotificationModalOpen(true)} />
                <div className="hidden items-center gap-3 md:flex">
                  <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-medium text-slate-700">
                    Welcome, {user?.username || 'Admin'}
                  </div>
                </div>
                <button
                  onClick={() => setIsLogoutConfirmationOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogoutIcon />
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isLogoutConfirmationOpen}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the system."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmationOpen(false)}
      />
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const isActive = window.location.pathname === href;

  return (
    <button
      onClick={() => {
        onNavigate();
        navigate(href);
      }}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
        isActive
          ? 'bg-blue-700 text-white shadow-md shadow-blue-100'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-blue-700'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12 12 4l8 8" />
      <path d="M6 10v10h12V10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="9.5" cy="8" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.9" />
      <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
    </svg>
  );
}

function LoanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h10M7 14h6" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M7 14h3" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.08 1.65V21a2 2 0 1 1-4 0v-.09A1.8 1.8 0 0 0 8.74 19.3a1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.65-1.08H2.5a2 2 0 1 1 0-4h.09A1.8 1.8 0 0 0 4.24 8.1a1.8 1.8 0 0 0-.36-1.98l-.06-.06A2 2 0 1 1 6.65 3.2l.06.06a1.8 1.8 0 0 0 1.98.36h.01A1.8 1.8 0 0 0 9.78 2h.09a2 2 0 1 1 4 0v.09a1.8 1.8 0 0 0 1.08 1.65 1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 8.1v.01a1.8 1.8 0 0 0 1.65 1.08h.09a2 2 0 1 1 0 4h-.09A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M3 9h18" />
      <path d="M8 3v6" />
      <path d="M16 3v6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
