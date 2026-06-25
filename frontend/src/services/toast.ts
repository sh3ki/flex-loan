import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
      position: 'top-right',
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
      position: 'top-right',
    });
  },
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      position: 'top-right',
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
    });
  },
  dismiss: (id: string | number) => {
    toast.dismiss(id);
  },
};
