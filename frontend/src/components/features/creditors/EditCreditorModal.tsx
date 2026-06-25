import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../common/Modal';
import { creditorSchema, CreditorFormData } from '../../../schemas/forms.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useEffect } from 'react';
import { queryKeys } from '../../../queries/queryKeys';
import { updateInListCachesById } from '../../../queries/cache.utils';

interface EditCreditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditorId: string | null;
}

interface CreditorDetail extends CreditorFormData {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function EditCreditorModal({
  isOpen,
  onClose,
  creditorId,
}: EditCreditorModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreditorFormData>({
    resolver: zodResolver(creditorSchema),
  });

  const { data: creditor } = useQuery<CreditorDetail>({
    queryKey: ['creditor', creditorId],
    queryFn: () => api.get(`/api/creditors/${creditorId}`).then((res) => res.data),
    enabled: isOpen && !!creditorId,
  });

  useEffect(() => {
    if (creditor) {
      reset({
        firstName: creditor.firstName,
        middleName: creditor.middleName,
        lastName: creditor.lastName,
        contactNumber: creditor.contactNumber,
        email: creditor.email,
        address: creditor.address,
        notes: creditor.notes,
      });
    }
  }, [creditor, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: CreditorFormData) =>
      api.put(`/api/creditors/${creditorId}`, data).then((res) => res.data),
    onSuccess: (updatedCreditor) => {
      showToast.success('Borrower updated successfully', 'Changes have been saved');
      if (creditorId) {
        updateInListCachesById(queryClient, queryKeys.creditors.all, creditorId, () => updatedCreditor);
        queryClient.setQueryData(['creditor', creditorId], updatedCreditor);
      }
      reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to update borrower';
      showToast.error('Failed to update borrower', errorMessage);
    },
  });

  const onSubmit = (data: CreditorFormData) => {
    if (!data.firstName || !data.lastName) {
      showToast.error('Incomplete form', 'First name and last name are required');
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
      title="Edit Borrower"
      description="Update the borrower information below"
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
            {updateMutation.isPending ? 'Updating...' : 'Update Borrower'}
          </button>
        </div>

        {updateMutation.isError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Failed to update borrower. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
}
