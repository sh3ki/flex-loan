import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../common/Modal';
import { paymentSchema, PaymentFormData } from '../../../schemas/forms.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { queryKeys } from '../../../queries/queryKeys';
import { useEffect } from 'react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLoanId?: string | null;
}

interface Loan {
  id: string;
  loanNumber: string;
  status: string;
  creditor: {
    firstName: string;
    lastName: string;
  };
  principal: number | string;
  remainingBalance: number | string;
}

export function AddPaymentModal({ isOpen, onClose, preselectedLoanId }: AddPaymentModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const selectedLoanId = watch('loanId');

  // Get today's date in Philippine timezone
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const year = phTime.getFullYear();
      const month = String(phTime.getMonth() + 1).padStart(2, '0');
      const day = String(phTime.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      setValue('paymentDate', todayString);

      if (preselectedLoanId) {
        setValue('loanId', preselectedLoanId);
      }
    }
  }, [isOpen, preselectedLoanId, setValue]);

  // Fetch loans - include active and overdue loans for payment recording
  const { data: loansData } = useQuery({
    queryKey: ['loans', 'record-payment-options'],
    queryFn: () =>
      api.get('/api/loans?limit=1000&status=all').then((res) => res.data.data),
    enabled: isOpen,
  });

  const paymentLoanOptions = loansData?.filter((loan: Loan) => {
    const normalizedStatus = (loan.status || '').toLowerCase();
    const isPayableStatus = normalizedStatus === 'active' || normalizedStatus === 'overdue';
    const hasRemainingBalance = Number(loan.remainingBalance) > 0;
    return isPayableStatus && hasRemainingBalance;
  });

  // Get selected loan details
  const selectedLoan = loansData?.find((loan: Loan) => loan.id === selectedLoanId);

  const createMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      api.post('/api/payments', data).then((res) => res.data),
    onSuccess: () => {
      showToast.success('Payment recorded successfully', 'The payment has been added');
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to record payment';
      showToast.error('Failed to record payment', errorMessage);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (!data.loanId || !data.amount || !data.paymentDate || !data.paymentMethod) {
      showToast.error('Incomplete form', 'Please fill in all required fields');
      return;
    }
    createMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Record Payment"
      description="Add a new payment for a loan"
      onClose={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Loan Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Loan *
          </label>
          <select
            {...register('loanId')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Choose a loan...</option>
            {paymentLoanOptions?.map((loan: Loan) => (
              <option key={loan.id} value={loan.id}>
                {loan.loanNumber} - Borrower: {loan.creditor.firstName} {loan.creditor.lastName} - ₱{Number(loan.principal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </option>
            ))}
          </select>
          {errors.loanId && (
            <p className="mt-1 text-xs text-red-600">{errors.loanId.message}</p>
          )}
        </div>

        {/* Show remaining balance if loan selected */}
        {selectedLoan && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-slate-600">Remaining Balance</p>
            <p className="text-lg font-semibold text-red-600">
              ₱ {Number(selectedLoan.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount *
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              min="0.01"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date *
            </label>
            <input
              {...register('paymentDate')}
              type="date"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
            {errors.paymentDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method *
            </label>
            <select
              {...register('paymentMethod')}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Choose payment method...</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-xs text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reference Number
            </label>
            <input
              {...register('referenceNumber')}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="TXN-123456"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            placeholder="Additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 transition"
          >
            {createMutation.isPending ? 'Recording...' : 'Record Payment'}
          </button>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Failed to record payment. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
}
