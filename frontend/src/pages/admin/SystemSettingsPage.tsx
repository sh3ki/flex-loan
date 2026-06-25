import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAdminSettingsQuery, useUpdateSettingsMutation } from '../../queries';
import { showToast } from '../../services/toast';
import { SystemSettings } from '../../types';

const emptySettings: SystemSettings = {
  businessName: '',
  tagline: '',
  heroTitle: '',
  heroSubtitle: '',
  ctaText: '',
  loanMinimum: 1000,
  loanMaximum: 10000,
  dailyInterestRate: 1,
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
};

export function SystemSettingsPage() {
  const { data, isLoading } = useAdminSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const [form, setForm] = useState<SystemSettings>(emptySettings);

  useEffect(() => {
    if (data) {
      setForm((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  const updateField = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.loanMinimum > form.loanMaximum) {
      showToast.error('Invalid range', 'Loan minimum cannot be greater than maximum');
      return;
    }

    try {
      const toastId = showToast.loading('Saving settings...', 'Updating landing page details');
      await updateSettingsMutation.mutateAsync(form);
      showToast.dismiss(toastId);
      showToast.success('Settings updated', 'Landing page details are now updated');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update settings';
      showToast.error('Update failed', message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage landing page business details without code edits.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Brand & Hero</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Business Name">
                  <input
                    value={form.businessName}
                    onChange={(event) => updateField('businessName', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    value={form.tagline}
                    onChange={(event) => updateField('tagline', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Hero Title">
                  <input
                    value={form.heroTitle}
                    onChange={(event) => updateField('heroTitle', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Hero Subtitle">
                  <input
                    value={form.heroSubtitle}
                    onChange={(event) => updateField('heroSubtitle', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Call-to-Action Text">
                  <input
                    value={form.ctaText}
                    onChange={(event) => updateField('ctaText', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Loan Offer</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Minimum Amount">
                  <input
                    type="number"
                    value={form.loanMinimum}
                    onChange={(event) => updateField('loanMinimum', Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Maximum Amount">
                  <input
                    type="number"
                    value={form.loanMaximum}
                    onChange={(event) => updateField('loanMaximum', Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Daily Interest Rate (%)">
                  <input
                    type="number"
                    step="0.01"
                    value={form.dailyInterestRate}
                    onChange={(event) => updateField('dailyInterestRate', Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Contact Details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Email">
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => updateField('contactEmail', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={form.contactPhone}
                    onChange={(event) => updateField('contactPhone', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
                <Field label="Address" className="md:col-span-2">
                  <input
                    value={form.contactAddress}
                    onChange={(event) => updateField('contactAddress', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </Field>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
