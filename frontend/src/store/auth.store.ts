import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // Sync with localStorage
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        // Clear from localStorage
        localStorage.removeItem('accessToken');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        // On rehydration, ensure localStorage token is in sync
        if (state && state.accessToken && !localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', state.accessToken);
        } else if (!state?.accessToken || !state?.isAuthenticated) {
          // If store shows no auth, clear localStorage
          localStorage.removeItem('accessToken');
        }
      },
    }
  )
);
