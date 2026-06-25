import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../common/Modal';
import api from '../../../services/api';

interface ViewCreditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditorId: string | null;
}

interface CreditorDetail {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function ViewCreditorModal({
  isOpen,
  onClose,
  creditorId,
}: ViewCreditorModalProps) {
  const { data: creditor, isLoading } = useQuery<CreditorDetail>({
    queryKey: ['creditor', creditorId],
    queryFn: () => api.get(`/api/creditors/${creditorId}`).then((res) => res.data),
    enabled: isOpen && !!creditorId,
  });

  if (!creditor && isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        title="View Borrower"
        onClose={onClose}
        size="lg"
      >
        <div className="py-8 text-center text-slate-500">Loading...</div>
      </Modal>
    );
  }

  if (!creditor) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Borrower Details"
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">First Name</p>
              <p className="text-sm font-medium text-slate-900">
                {creditor.firstName}
              </p>
            </div>
            {creditor.middleName && (
              <div>
                <p className="text-sm text-slate-600">Middle Name</p>
                <p className="text-sm font-medium text-slate-900">
                  {creditor.middleName}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Last Name</p>
              <p className="text-sm font-medium text-slate-900">
                {creditor.lastName}
              </p>
            </div>
            {creditor.contactNumber && (
              <div>
                <p className="text-sm text-slate-600">Contact Number</p>
                <p className="text-sm font-medium text-slate-900">
                  {creditor.contactNumber}
                </p>
              </div>
            )}
            {creditor.email && (
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-sm font-medium text-slate-900">
                  {creditor.email}
                </p>
              </div>
            )}
            {creditor.address && (
              <div>
                <p className="text-sm text-slate-600">Address</p>
                <p className="text-sm font-medium text-slate-900">
                  {creditor.address}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <div className="mt-1">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {creditor.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {creditor.notes && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Notes
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {creditor.notes}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-600">Created</p>
              <p className="font-medium text-slate-900">
                {new Date(creditor.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Updated</p>
              <p className="font-medium text-slate-900">
                {new Date(creditor.updatedAt).toLocaleDateString()}
              </p>
            </div>
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
