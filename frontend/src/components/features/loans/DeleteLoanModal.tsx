import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { queryKeys } from '../../../queries/queryKeys';
import { removeFromListCachesById } from '../../../queries/cache.utils';

interface DeleteLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string | null;
  loanNumber?: string;
}

export function DeleteLoanModal({
  isOpen,
  onClose,
  loanId,
  loanNumber = 'This loan',
}: DeleteLoanModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      api.delete(`/api/loans/${loanId}`).then((res) => res.data),
    onSuccess: () => {
      showToast.success('Loan deleted successfully', 'The loan has been removed');
      if (loanId) {
        removeFromListCachesById(queryClient, queryKeys.loans.all, loanId);
        queryClient.removeQueries({ queryKey: ['loan', loanId] });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete loan';
      showToast.error('Failed to delete loan', errorMessage);
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Delete Loan"
      message={`Are you sure you want to delete loan ${loanNumber}? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      isDangerous={true}
      isLoading={deleteMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
