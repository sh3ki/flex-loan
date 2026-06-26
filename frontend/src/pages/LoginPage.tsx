import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useLoginMutation } from '../queries/auth.queries';
import { useAuthStore } from '../store/auth.store';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { showToast } from '../services/toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries/queryKeys';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const toastId = showToast.loading('Signing in...', 'Please wait');
      
      const response = await loginMutation.mutateAsync(data);

      // Store token
      localStorage.setItem('accessToken', response.accessToken);

      // Update auth store
      setAuth(response.user, response.accessToken);

      // Check and create notifications for loan due dates
      api.post('/api/notifications/check').catch((err) => {
        console.error('Failed to check notifications:', err);
      });

      // Preload dashboard data for faster load
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.summary(),
        queryFn: () => api.get('/api/dashboard/summary').then((res) => res.data),
        staleTime: 30 * 1000,
      });

      showToast.dismiss(toastId);
      showToast.success('Login successful', 'Welcome back!');

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      showToast.error('Login failed', errorMsg);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1665b8] px-4 py-10 md:px-8 md:py-14">
      <div className="pointer-events-none absolute -left-10 top-8 h-44 w-44 rounded-full border-16 border-[#f0db3d] opacity-80" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-[#f0db3d]/90" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-4xl border-4 border-white/60 bg-[#eceff3] shadow-2xl shadow-black/20 md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#1665b8] p-9 text-white md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0db3d]">MFLEX</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none">Portal Login</h1>
            <p className="mt-4 text-sm text-blue-100">
              Manage your direct lending records, payments, and borrower updates from one workspace.
            </p>
          </div>

        </div>

        <div className="p-7 md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1665b8]">Secure Access</p>
            <h2 className="mt-2 text-4xl font-black uppercase text-[#1665b8]">Sign In</h2>
            <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-[#1665b8] focus:ring-2 focus:ring-blue-200"
                {...register('username')}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-[#1665b8] focus:ring-2 focus:ring-blue-200"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1665b8]" />
                Remember me
              </label>
              <Link to="/" className="font-medium text-[#1665b8] hover:text-[#0f569f]">
                Back to site
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full rounded-xl bg-[#1665b8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f569f] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-yellow-300 bg-[#f0db3d] px-4 py-3 text-sm text-slate-700 md:hidden">
            <p className="font-semibold text-slate-900">Default Login</p>
            <p className="mt-1">Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
