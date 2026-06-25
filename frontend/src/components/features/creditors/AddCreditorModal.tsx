import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../common/Modal';
import { creditorSchema, CreditorFormData } from '../../../schemas/forms.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { queryKeys } from '../../../queries/queryKeys';
import { prependToListCaches } from '../../../queries/cache.utils';

interface AddCreditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCreditorModal({ isOpen, onClose }: AddCreditorModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreditorFormData>({
    resolver: zodResolver(creditorSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreditorFormData) =>
      api.post('/api/creditors', data).then((res) => res.data),
    onSuccess: (createdCreditor) => {
      showToast.success('Borrower added successfully', 'The borrower has been added to the system');
      prependToListCaches(queryClient, queryKeys.creditors.all, createdCreditor, 10);
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to add borrower';
      showToast.error('Failed to add borrower', errorMessage);
    },
  });

  const onSubmit = (data: CreditorFormData) => {
    if (!data.firstName || !data.lastName) {
      showToast.error('Incomplete form', 'First name and last name are required');
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
      title="Add New Borrower"
      description="Fill in the borrower information below"
      onClose={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Middle Name
            </label>
            <input
              {...register('middleName')}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="M"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Number
            </label>
            <input
              {...register('contactNumber')}
              type="tel"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="09123456789"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <input
              {...register('address')}
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="123 Main St"
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
            {createMutation.isPending ? 'Creating...' : 'Add Borrower'}
          </button>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Failed to create borrower. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
}
