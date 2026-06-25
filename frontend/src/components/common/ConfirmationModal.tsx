import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      size="sm"
      closeOnBackdropClick={!isLoading}
    >
      <div className="flex items-start gap-4">
        {isDangerous && (
          <div className="mt-1 flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-slate-700">{message}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-600'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600'
          } disabled:opacity-50`}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
