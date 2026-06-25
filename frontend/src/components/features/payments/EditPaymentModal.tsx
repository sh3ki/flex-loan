import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../common/Modal';
import { paymentSchema, PaymentFormData } from '../../../schemas/forms.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useEffect } from 'react';
import { queryKeys } from '../../../queries/queryKeys';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

interface PaymentDetail extends PaymentFormData {
  id: string;
  paymentNumber: string;
  createdAt: string;
}

interface Loan {
  id: string;
  loanNumber: string;
  creditor: {
    firstName: string;
    lastName: string;
  };
  remainingBalance: number;
}

export function EditPaymentModal({
  isOpen,
  onClose,
  paymentId,
}: EditPaymentModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const selectedLoanId = watch('loanId');

  // Fetch payment data
  const { data: payment } = useQuery<PaymentDetail>({
    queryKey: ['payment', paymentId],
    queryFn: () => api.get(`/api/payments/${paymentId}`).then((res) => res.data),
    enabled: isOpen && !!paymentId,
  });

  // Fetch the specific loan for this payment
  const { data: selectedLoan } = useQuery<Loan>({
    queryKey: ['loan', selectedLoanId],
    queryFn: () => api.get(`/api/loans/${selectedLoanId}`).then((res) => res.data),
    enabled: isOpen && !!selectedLoanId,
  });

  useEffect(() => {
    if (payment) {
      reset({
        loanId: payment.loanId || '',
        amount: Number(payment.amount) || 0,
        paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
        paymentMethod: payment.paymentMethod || '',
        referenceNumber: payment.referenceNumber || '',
        notes: payment.notes || '',
      });
    }
  }, [payment, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      api.put(`/api/payments/${paymentId}`, data).then((res) => res.data),
    onSuccess: () => {
      showToast.success('Payment updated successfully', 'Changes have been saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to update payment';
      showToast.error('Failed to update payment', errorMessage);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (!data.loanId || !data.amount || !data.paymentDate || !data.paymentMethod) {
      showToast.error('Incomplete form', 'Please fill in all required fields');
      return;
    }
    updateMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Payment"
      description="Update the payment details below"
      onClose={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Loan Selection - Display Only */}
        <input type="hidden" {...register('loanId')} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Loan
          </label>
          {selectedLoan ? (
            <div className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-slate-50 text-slate-700">
              <p className="text-sm font-medium">
                {selectedLoan.loanNumber} - {selectedLoan.creditor.firstName} {selectedLoan.creditor.lastName}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Balance: ₱{selectedLoan.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-slate-50 text-slate-500">
              <p className="text-sm">Loading loan details...</p>
            </div>
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
            disabled={updateMutation.isPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 transition"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Payment'}
          </button>
        </div>

        {updateMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Failed to update payment. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
}
