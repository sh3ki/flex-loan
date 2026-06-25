import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { queryKeys } from '../../../queries/queryKeys';
import { removeFromListCachesById } from '../../../queries/cache.utils';

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
  paymentNumber?: string;
}

export function DeletePaymentModal({
  isOpen,
  onClose,
  paymentId,
  paymentNumber = 'This payment',
}: DeletePaymentModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      api.delete(`/api/payments/${paymentId}`).then((res) => res.data),
    onSuccess: () => {
      showToast.success('Payment deleted successfully', 'The payment has been removed');
      if (paymentId) {
        removeFromListCachesById(queryClient, queryKeys.payments.all, paymentId);
        queryClient.removeQueries({ queryKey: ['payment', paymentId] });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete payment';
      showToast.error('Failed to delete payment', errorMessage);
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Delete Payment"
      message={`Are you sure you want to delete payment ${paymentNumber}? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      isDangerous={true}
      isLoading={deleteMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
