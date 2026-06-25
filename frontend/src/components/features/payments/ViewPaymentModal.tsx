import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../common/Modal';
import api from '../../../services/api';

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number | string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

interface LoanDetail {
  id: string;
  loanNumber: string;
  creditor: {
    firstName: string;
    lastName: string;
  };
  principal: number;
  totalPayable: number;
  remainingBalance: number;
  dueDate: string;
  payments: Payment[];
}

export function ViewPaymentModal({
  isOpen,
  onClose,
  paymentId,
}: ViewPaymentModalProps) {
  const { data: payment, isLoading: isPaymentLoading } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => api.get(`/api/payments/${paymentId}`).then((res) => res.data),
    enabled: isOpen && !!paymentId,
  });

  const { data: loanData, isLoading: isLoanLoading } = useQuery<LoanDetail>({
    queryKey: ['loan', payment?.loanId],
    queryFn: () =>
      api.get(`/api/loans/${payment?.loanId}`).then((res) => res.data),
    enabled: isOpen && !!payment?.loanId,
  });

  const isLoading = isPaymentLoading || isLoanLoading;

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        title="Payment History"
        onClose={onClose}
        size="lg"
      >
        <div className="py-8 text-center text-slate-500">Loading...</div>
      </Modal>
    );
  }

  if (!payment || !loanData) {
    return null;
  }

  const totalPaid = loanData.payments
    ?.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      title="Payment History"
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-6">
        {/* Loan Information Header */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Loan Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Loan Number</p>
              <p className="text-sm font-medium text-slate-900">
                {loanData.loanNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Borrower</p>
              <p className="text-sm font-medium text-slate-900">
                {loanData.creditor.firstName} {loanData.creditor.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Payment History
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Payment #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {loanData.payments && loanData.payments.length > 0 ? (
                  loanData.payments.map((p: Payment) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-800">
                        {p.paymentNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        ₱{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {p.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {p.referenceNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {p.notes ? p.notes.substring(0, 30) + (p.notes.length > 30 ? '...' : '') : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="border-t border-slate-200 pt-6 grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-600">Total Paid</p>
            <p className="text-lg font-semibold text-green-600">
              ₱{Number(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Remaining Balance</p>
            <p className="text-lg font-semibold text-red-600">
              ₱{Number(loanData.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Due Date</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(loanData.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
