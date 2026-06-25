import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../common/Modal';
import api from '../../../services/api';

interface ViewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string | null;
}

interface LoanDetail {
  id: string;
  loanNumber: string;
  creditor: {
    firstName: string;
    lastName: string;
    contactNumber?: string | null;
    address?: string | null;
  };
  principal: number | string;
  interestPerDay: number | string;
  termDays: number;
  releaseDate: string | Date;
  dueDate: string | Date;
  dailyInterest: number | string;
  totalInterest: number | string;
  totalPayable: number | string;
  paidAmount: number | string;
  remainingBalance: number | string;
  status: string;
  payments?: Array<{
    id: string;
    paymentNumber: string;
    amount: number | string;
    paymentDate: string | Date;
    paymentMethod: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function ViewLoanModal({ isOpen, onClose, loanId }: ViewLoanModalProps) {
  const { data: loan, isLoading } = useQuery<LoanDetail>({
    queryKey: ['loan', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}`).then((res) => res.data),
    enabled: isOpen && !!loanId,
  });

  if (!loan && isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        title="View Loan"
        onClose={onClose}
        size="lg"
      >
        <div className="py-8 text-center text-slate-500">Loading...</div>
      </Modal>
    );
  }

  if (!loan) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Loan Details"
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {/* Borrower Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Borrower Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Name</p>
              <p className="text-sm font-medium text-slate-900">
                {loan.creditor?.firstName} {loan.creditor?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Contact Number</p>
              <p className="text-sm font-medium text-slate-900">
                {loan.creditor?.contactNumber || 'N/A'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-600">Address</p>
              <p className="text-sm font-medium text-slate-900">
                {loan.creditor?.address || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Information */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Loan Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Loan Number</p>
              <p className="text-sm font-medium text-slate-900">
                {loan.loanNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Principal</p>
              <p className="text-sm font-medium text-slate-900">
                ₱ {Number(loan.principal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Interest Per Day</p>
              <p className="text-sm font-medium text-slate-900">
                {Number(loan.interestPerDay).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Term</p>
              <p className="text-sm font-medium text-slate-900">
                {loan.termDays} days
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Release Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(loan.releaseDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Due Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(loan.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Financial Summary
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Daily Interest</p>
              <p className="text-sm font-semibold text-slate-900">
                ₱ {Number(loan.dailyInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Interest</p>
              <p className="text-sm font-semibold text-slate-900">
                ₱ {Number(loan.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Payable</p>
              <p className="text-sm font-semibold text-blue-700 text-lg">
                ₱ {Number(loan.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <div className="mt-1">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-300">
                  {loan.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Paid Amount</p>
              <p className="text-sm font-medium text-green-600">
                ₱ {Number(loan.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Remaining Balance</p>
              <p className="text-sm font-medium text-red-600">
                ₱ {Number(loan.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {loan.payments && loan.payments.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Payment History ({loan.payments.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Payment #</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Amount</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-slate-800">{payment.paymentNumber}</td>
                      <td className="px-3 py-2 text-slate-700">
                        ₱ {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{payment.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
