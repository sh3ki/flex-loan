import { useDashboardSummaryQuery } from '../../queries';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummaryQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-700 border-r-transparent" />
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">Error loading dashboard</p>
            <p className="mt-1 text-sm text-red-600">{(error as any)?.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {};
  const collections = data?.collections || {};
  const loanDistribution = data?.loanDistribution || {};

  // Prepare data for pie chart
  const distributionData = Object.entries(loanDistribution).map(([name, count]) => ({
    name: name || 'Unknown',
    value: count as number,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Prepare collection status data
  const collectionStatusData = [
    {
      name: 'Overdue',
      loans: collections.overdue?.count || 0,
      amount: collections.overdue?.totalAmount || 0,
      color: '#ef4444',
    },
    {
      name: 'Due Today',
      loans: collections.dueToday?.count || 0,
      amount: collections.dueToday?.totalAmount || 0,
      color: '#f59e0b',
    },
    {
      name: 'Due This Week',
      loans: collections.dueThisWeek?.count || 0,
      amount: collections.dueThisWeek?.totalAmount || 0,
      color: '#3b82f6',
    },
  ];

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  };

  const formatCurrencyFull = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Analytics & Performance</h1>
          <p className="mt-2 text-sm text-slate-500">Real-time insights into lending performance and collections.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Released"
            value={formatCurrency(stats.totalReleased || 0)}
            subValue={formatCurrencyFull(stats.totalReleased || 0)}
            icon="release"
            tone="blue"
          />
          <MetricCard
            label="Total Collections"
            value={formatCurrency(stats.totalCollections || 0)}
            subValue={formatCurrencyFull(stats.totalCollections || 0)}
            icon="collect"
            tone="green"
          />
          <MetricCard
            label="Total Payables"
            value={formatCurrency(stats.totalPayables || 0)}
            subValue={formatCurrencyFull(stats.totalPayables || 0)}
            icon="payable"
            tone="yellow"
          />
          <MetricCard
            label="Profit Generated"
            value={formatCurrency(stats.profit || 0)}
            subValue={formatCurrencyFull(stats.profit || 0)}
            icon="profit"
            tone={stats.profit > 0 ? 'emerald' : 'red'}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            label="Active Borrowers"
            value={stats.totalCreditors || 0}
            icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
            tone="blue"
          />
          <StatCard
            label="Active Loans"
            value={stats.activeLoans || 0}
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            tone="green"
          />
          <StatCard
            label="Overdue Loans"
            value={stats.overdueLoans || 0}
            icon={<AlertCircle className="h-5 w-5 text-red-600" />}
            tone="red"
          />
        </div>

        {/* Collections Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Collections Status</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {collectionStatusData.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{item.name}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{item.loans} loans</p>
                    <p className="mt-1 text-sm text-slate-600">{formatCurrencyFull(item.amount)}</p>
                  </div>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Loan Status Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Loan Status Distribution</h2>
            {distributionData.length > 0 ? (
              <div className="mt-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 text-center text-sm text-slate-500">No loan data available</div>
            )}
          </div>

          {/* Collections Forecast */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Collections Breakdown</h2>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={collectionStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="loans" fill="#3b82f6" name="Number of Loans" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Financial Summary Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Financial Summary</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Released Amount</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrencyFull(stats.totalReleased || 0)}</p>
              <p className="text-xs text-slate-500">Total principal disbursed</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Collections Amount</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrencyFull(stats.totalCollections || 0)}</p>
              <p className="text-xs text-slate-500">Total amount collected</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrencyFull(stats.totalPayables || 0)}</p>
              <p className="text-xs text-slate-500">Total remaining payable</p>
            </div>
          </div>

          {/* Financial Metrics Bar */}
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: 'Financial Metrics',
                    Released: stats.totalReleased || 0,
                    Collections: stats.totalCollections || 0,
                    Payables: stats.totalPayables || 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrencyFull(value as number)}
                />
                <Legend />
                <Bar dataKey="Released" fill="#3b82f6" />
                <Bar dataKey="Collections" fill="#10b981" />
                <Bar dataKey="Payables" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent Activities</h2>
          {data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="mt-5 space-y-3">
              {data.recentActivities.map((activity: any, index: number) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{activity.type}</p>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      <p className="mt-1 text-xs text-slate-500">{activity.creditorName}</p>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No recent activities yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value, subValue, icon, tone }: { label: string; value: string; subValue: string; icon: string; tone: 'blue' | 'green' | 'yellow' | 'red' | 'emerald' }) {
  const toneClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-300 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  };

  const iconClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${iconClasses[tone]}`}>{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subValue}</p>
        </div>
        <div className={`h-3 w-3 rounded-full ${iconClasses[tone]}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'blue' | 'green' | 'red' }) {
  const toneClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
