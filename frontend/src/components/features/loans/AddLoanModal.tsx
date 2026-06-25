import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../common/Modal';
import { loanSchema, LoanFormData } from '../../../schemas/forms.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useState, useEffect } from 'react';
import { queryKeys } from '../../../queries/queryKeys';
import { prependToListCaches } from '../../../queries/cache.utils';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Creditor {
  id: string;
  firstName: string;
  lastName: string;
}

export function AddLoanModal({ isOpen, onClose }: AddLoanModalProps) {
  const queryClient = useQueryClient();
  const [calculatedValues, setCalculatedValues] = useState({
    dailyInterest: 0,
    totalInterest: 0,
    totalPayable: 0,
    dueDate: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const principal = watch('principal');
  const interestPerDay = watch('interestPerDay');
  const termDays = watch('termDays');
  const releaseDate = watch('releaseDate');

  // Fetch creditors
  const { data: creditorsData } = useQuery({
    queryKey: ['creditors', 'all'],
    queryFn: () =>
      api.get('/api/creditors?limit=1000').then((res) => res.data.data),
    enabled: isOpen,
  });

  // Calculate values
  useEffect(() => {
    if (principal && interestPerDay && termDays && releaseDate) {
      const daily = principal * (interestPerDay / 100);
      const total = daily * termDays;
      const payable = principal + total;

      const release = new Date(releaseDate);
      const due = new Date(release);
      due.setDate(due.getDate() + termDays);

      setCalculatedValues({
        dailyInterest: daily,
        totalInterest: total,
        totalPayable: payable,
        dueDate: due.toISOString().split('T')[0],
      });
    }
  }, [principal, interestPerDay, termDays, releaseDate]);

  const createMutation = useMutation({
    mutationFn: (data: LoanFormData) =>
      api.post('/api/loans', data).then((res) => res.data),
    onSuccess: (createdLoan) => {
      showToast.success('Loan created successfully', 'New loan has been added');
      prependToListCaches(queryClient, queryKeys.loans.all, createdLoan, 10);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to create loan';
      showToast.error('Failed to create loan', errorMessage);
    },
  });

  const onSubmit = (data: LoanFormData) => {
    if (!data.creditorId || !data.principal || !data.interestPerDay || !data.termDays || !data.releaseDate) {
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
      title="Create New Loan"
      description="Fill in the loan details below"
      onClose={handleClose}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Borrower Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Borrower Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Borrower *
            </label>
            <select
              {...register('creditorId')}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Choose a borrower...</option>
              {creditorsData?.map((creditor: Creditor) => (
                <option key={creditor.id} value={creditor.id}>
                  {creditor.firstName} {creditor.lastName}
                </option>
              ))}
            </select>
            {errors.creditorId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.creditorId.message}
              </p>
            )}
          </div>
        </div>

        {/* Loan Details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Loan Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Principal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Principal Amount *
              </label>
              <input
                {...register('principal', { valueAsNumber: true })}
                type="number"
                min="0.01"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                placeholder="10000"
              />
              {errors.principal && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.principal.message}
                </p>
              )}
            </div>

            {/* Interest Per Day */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Interest Per Day (%) *
              </label>
              <input
                {...register('interestPerDay', { valueAsNumber: true })}
                type="number"
                min="0.01"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                placeholder="1"
              />
              {errors.interestPerDay && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.interestPerDay.message}
                </p>
              )}
            </div>

            {/* Term Days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Term (Days) *
              </label>
              <input
                {...register('termDays', { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                placeholder="30"
              />
              {errors.termDays && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.termDays.message}
                </p>
              )}
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Release Date *
              </label>
              <input
                {...register('releaseDate')}
                type="date"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
              {errors.releaseDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.releaseDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Calculated Values */}
        {principal && interestPerDay && termDays && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-xs">
              <div>
                <p className="text-slate-600">Daily Interest</p>
                <p className="font-semibold text-slate-900">
                  ₱ {Number(calculatedValues.dailyInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Total Interest</p>
                <p className="font-semibold text-slate-900">
                  ₱ {Number(calculatedValues.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Total Payable</p>
                <p className="font-semibold text-slate-900">
                  ₱ {Number(calculatedValues.totalPayable).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Due Date</p>
                <p className="font-semibold text-slate-900">
                  {new Date(calculatedValues.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

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
            {createMutation.isPending ? 'Creating...' : 'Create Loan'}
          </button>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Failed to create loan. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
}
