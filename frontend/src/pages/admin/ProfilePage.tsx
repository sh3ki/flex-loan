import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAuthStore } from '../../store/auth.store';
import { useUpdateProfileMutation } from '../../queries/auth.queries';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const updateProfileMutation = useUpdateProfileMutation();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setErrorMessage('Username cannot be empty');
      return;
    }

    if (username === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setErrorMessage('');
      const response = await updateProfileMutation.mutateAsync({ username });
      setUser(response.user);
      setIsEditingUsername(false);
      setSuccessMessage('Username updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update username');
    }
  };

  const handleSavePassword = async () => {
    if (!password.trim()) {
      setErrorMessage('Password cannot be empty');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setErrorMessage('');
      await updateProfileMutation.mutateAsync({ password });
      setIsEditingPassword(false);
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update password');
    }
  };

  const handleCancelUsername = () => {
    setUsername(user?.username || '');
    setIsEditingUsername(false);
    setErrorMessage('');
  };

  const handleCancelPassword = () => {
    setPassword('');
    setConfirmPassword('');
    setIsEditingPassword(false);
    setErrorMessage('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Administrator account details and security controls.</p>
        </div>

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Username Section */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
            {isEditingUsername ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new username"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelUsername}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2">
                <span className="text-slate-800">{user?.username}</span>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            {isEditingPassword ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePassword}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelPassword}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2">
                <span className="text-slate-800">••••••••</span>
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
