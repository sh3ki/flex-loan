import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { queryKeys } from '../../../queries/queryKeys';
import { removeFromListCachesById } from '../../../queries/cache.utils';

interface DeleteCreditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditorId: string | null;
  creditorName?: string;
}

export function DeleteCreditorModal({
  isOpen,
  onClose,
  creditorId,
  creditorName = 'This borrower',
}: DeleteCreditorModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      api.delete(`/api/creditors/${creditorId}`).then((res) => res.data),
    onSuccess: () => {
      showToast.success('Borrower deleted successfully', 'The borrower has been removed');
      if (creditorId) {
        removeFromListCachesById(queryClient, queryKeys.creditors.all, creditorId);
        queryClient.removeQueries({ queryKey: ['creditor', creditorId] });
      }
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete borrower';
      showToast.error('Failed to delete borrower', errorMessage);
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Delete Borrower"
      message={`Are you sure you want to delete ${creditorName}? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      isDangerous={true}
      isLoading={deleteMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
