import { useLoansQuery } from '../../queries';
import { useCreditorsQuery } from '../../queries';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AddLoanModal } from '../../components/features/loans/AddLoanModal';
import { ViewLoanModal } from '../../components/features/loans/ViewLoanModal';
import { EditLoanModal } from '../../components/features/loans/EditLoanModal';
import { DeleteLoanModal } from '../../components/features/loans/DeleteLoanModal';
import { useState } from 'react';
import { Trash2, Eye, Edit2, Plus, Send } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNavigate } from 'react-router-dom';

function formatLoanStatus(status: string) {
  const normalized = (status || '').trim().toLowerCase();

  if (normalized === 'active') return 'Active';
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'overdue') return 'Overdue';

  return status;
}

export function LoansPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [creditorId, setCreditorId] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewLoanId, setViewLoanId] = useState<string | null>(null);
  const [editLoanId, setEditLoanId] = useState<string | null>(null);
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, isLoading, isError, error } = useLoansQuery(page, 10, debouncedSearch, status, creditorId);
  const { data: creditorsData } = useCreditorsQuery(1, 1000, '', 'active');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Loans</h1>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            <Plus size={18} />
            Add Loan
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Search loans..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            value={creditorId}
            onChange={(e) => {
              setCreditorId(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Borrowers</option>
            {creditorsData?.data?.map((creditor: any) => (
              <option key={creditor.id} value={creditor.id}>
                {creditor.firstName} {creditor.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">Loading...</div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center text-red-600">
            <p>Error loading loans: {(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            <p>No loans found. Create your first loan to get started.</p>
          </div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {data?.data?.map((loan: any) => (
              <article key={loan.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {(() => {
                  const statusLabel = formatLoanStatus(loan.status);
                  const statusKey = statusLabel.toLowerCase();

                  return (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Loan #</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">{loan.loanNumber}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusKey === 'active'
                        ? 'bg-blue-50 text-blue-700'
                        : statusKey === 'paid'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                  );
                })()}

                <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                  <p><span className="font-medium text-slate-900">Borrower:</span> {loan.creditor?.firstName} {loan.creditor?.lastName}</p>
                  <p><span className="font-medium text-slate-900">Principal:</span> ₱{(loan.principal).toLocaleString()}</p>
                  <p><span className="font-medium text-slate-900">Payable:</span> ₱{Number(loan.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p><span className="font-medium text-slate-900">Balance:</span> <span className="font-semibold text-red-600">₱{Number(loan.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                  <p><span className="font-medium text-slate-900">Due:</span> {new Date(loan.dueDate).toLocaleDateString()}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewLoanId(loan.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                    title="View Details"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => navigate('/admin/payments', { state: { loanId: loan.id } })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                    title="Add Payment"
                  >
                    <Send size={14} />
                    Payment
                  </button>
                  <button
                    onClick={() => setEditLoanId(loan.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteLoanId(loan.id);
                      setSelectedLoanNumber(loan.loanNumber);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Loan #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Borrower</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Principal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Release Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Interest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Payable</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Balance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((loan: any) => (
                  <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-800">{loan.loanNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {loan.creditor?.firstName} {loan.creditor?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">₱{(loan.principal).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(loan.releaseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">₱{Number(loan.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₱{Number(loan.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">₱{Number(loan.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {(() => {
                        const statusLabel = formatLoanStatus(loan.status);
                        const statusKey = statusLabel.toLowerCase();

                        return (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusKey === 'active'
                            ? 'bg-blue-50 text-blue-700'
                            : statusKey === 'paid'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {statusLabel}
                      </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewLoanId(loan.id)}
                          className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button 
                          onClick={() => navigate('/admin/payments', { state: { loanId: loan.id } })}
                          className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-800"
                          title="Add Payment"
                        >
                          <Send size={16} />
                          Payment
                        </button>
                        <button 
                          onClick={() => setEditLoanId(loan.id)}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setDeleteLoanId(loan.id);
                            setSelectedLoanNumber(loan.loanNumber);
                          }}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Modals */}
        <AddLoanModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
        <ViewLoanModal isOpen={!!viewLoanId} onClose={() => setViewLoanId(null)} loanId={viewLoanId} />
        <EditLoanModal isOpen={!!editLoanId} onClose={() => setEditLoanId(null)} loanId={editLoanId} />
        <DeleteLoanModal 
          isOpen={!!deleteLoanId} 
          onClose={() => setDeleteLoanId(null)} 
          loanId={deleteLoanId}
          loanNumber={selectedLoanNumber}
        />
      </div>
    </AdminLayout>
  );
}
