import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAuthStore } from '../../store/auth.store';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Administrator account details and security controls.</p>
        </div>

        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-slate-800">{user?.username}</div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <div className="rounded-xl bg-slate-100 px-4 py-2 capitalize text-slate-800">{user?.role}</div>
          </div>

          <button className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            Change Password
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
