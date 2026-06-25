import { useCollectionsSummaryQuery } from '../../queries';
import { AdminLayout } from '../../components/layout/AdminLayout';

export function CollectionsPage() {
  const { data, isLoading } = useCollectionsSummaryQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Collections</h1>
          <p className="mt-2 text-sm text-slate-500">Track dues and overdue balances at a glance.</p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Due Today */}
            <CollectionCard
              title="Due Today"
              count={data?.dueToday?.count || 0}
              totalAmount={data?.dueToday?.totalAmount || 0}
              tone="blue"
            />

            {/* Due This Week */}
            <CollectionCard
              title="Due This Week"
              count={data?.dueThisWeek?.count || 0}
              totalAmount={data?.dueThisWeek?.totalAmount || 0}
              tone="yellow"
            />

            {/* Overdue */}
            <CollectionCard
              title="Overdue"
              count={data?.overdue?.count || 0}
              totalAmount={data?.overdue?.totalAmount || 0}
              tone="slate"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function CollectionCard({
  title,
  count,
  totalAmount,
  tone,
}: {
  title: string;
  count: number;
  totalAmount: number;
  tone: 'blue' | 'yellow' | 'slate';
}) {
  const toneClasses = {
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-300 bg-yellow-50',
    slate: 'border-slate-200 bg-slate-50',
  };

  return (
    <div className={`${toneClasses[tone]} rounded-2xl border p-6 shadow-sm`}>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-slate-900">{count} loans</p>
        <p className="text-lg text-slate-600">Total: ₱{totalAmount.toLocaleString()}</p>
      </div>
    </div>
  );
}
