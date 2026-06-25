import { usePaymentsQuery } from '../../queries';
import { useLoansQuery } from '../../queries';
import { useCreditorsQuery } from '../../queries';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AddPaymentModal } from '../../components/features/payments/AddPaymentModal';
import { ViewPaymentModal } from '../../components/features/payments/ViewPaymentModal';
import { EditPaymentModal } from '../../components/features/payments/EditPaymentModal';
import { DeletePaymentModal } from '../../components/features/payments/DeletePaymentModal';
import { useState, useEffect } from 'react';
import { Trash2, Eye, Edit2, Plus } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useLocation } from 'react-router-dom';

export function PaymentsPage() {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loanFilter, setLoanFilter] = useState('');
  const [creditorFilter, setCreditorFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [preselectedLoanId, setPreselectedLoanId] = useState<string | null>(null);
  const [viewPaymentId, setViewPaymentId] = useState<string | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [selectedPaymentNumber, setSelectedPaymentNumber] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, isLoading } = usePaymentsQuery(page, 10, debouncedSearch, loanFilter, creditorFilter);
  const { data: loansData } = useLoansQuery(1, 1000, '', 'active');
  const { data: creditorsData } = useCreditorsQuery(1, 1000, '', 'active');

  // Check if we came from loan page with a preselected loan
  useEffect(() => {
    const state = location.state as any;
    if (state?.loanId) {
      setPreselectedLoanId(state.loanId);
      setLoanFilter(state.loanId);
      setAddModalOpen(true);
      // Clear the state so it doesn't persist
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            <Plus size={18} />
            Add Payment
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={loanFilter}
            onChange={(e) => {
              setLoanFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Loans</option>
            {loansData?.data?.map((loan: any) => (
              <option key={loan.id} value={loan.id}>
                {loan.loanNumber}
              </option>
            ))}
          </select>
          <select
            value={creditorFilter}
            onChange={(e) => {
              setCreditorFilter(e.target.value);
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
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Payment #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Borrower</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Loan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-800">{payment.paymentNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {payment.loan?.creditor?.firstName} {payment.loan?.creditor?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{payment.loan?.loanNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">₱{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewPaymentId(payment.id)}
                          className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button 
                          onClick={() => setEditPaymentId(payment.id)}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setDeletePaymentId(payment.id);
                            setSelectedPaymentNumber(payment.paymentNumber);
                          }}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800"
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
        )}

        {/* Modals */}
        <AddPaymentModal isOpen={addModalOpen} onClose={() => { setAddModalOpen(false); setPreselectedLoanId(null); }} preselectedLoanId={preselectedLoanId} />
        <ViewPaymentModal isOpen={!!viewPaymentId} onClose={() => setViewPaymentId(null)} paymentId={viewPaymentId} />
        <EditPaymentModal isOpen={!!editPaymentId} onClose={() => setEditPaymentId(null)} paymentId={editPaymentId} />
        <DeletePaymentModal 
          isOpen={!!deletePaymentId} 
          onClose={() => setDeletePaymentId(null)} 
          paymentId={deletePaymentId}
          paymentNumber={selectedPaymentNumber}
        />
      </div>
    </AdminLayout>
  );
}
