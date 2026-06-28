import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { queryKeys } from './queryKeys';
import { updateInListCachesById } from './cache.utils';

const listQueryOptions = {
  staleTime: 2 * 60 * 1000,
  gcTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  placeholderData: keepPreviousData,
} as const;

// Creditor Queries
export const useCreditorsQuery = (page = 1, limit = 10, search = '', status = 'active', includeTotal = false) => {
  return useQuery({
    queryKey: queryKeys.creditors.list(page, limit, search, status, includeTotal),
    queryFn: () =>
      api.get('/api/creditors', { params: { page, limit, search, status, includeTotal } }).then((res) => res.data),
    ...listQueryOptions,
  });
};

export const useCreditorDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.creditors.detail(id),
    queryFn: () => api.get(`/api/creditors/${id}`).then((res) => res.data),
  });
};

export const useCreateCreditorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/api/creditors', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditors.all });
    },
  });
};

export const useUpdateCreditorMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put(`/api/creditors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditors.detail(id) });
    },
  });
};

export const useDeleteCreditorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/creditors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditors.all });
    },
  });
};

// Loan Queries
export const useLoansQuery = (page = 1, limit = 10, search = '', status = 'active', creditorId = '', includeTotal = false) => {
  return useQuery({
    queryKey: queryKeys.loans.list(page, limit, search, status, creditorId, includeTotal),
    queryFn: () =>
      api.get('/api/loans', { params: { page, limit, search, status, includeTotal, ...(creditorId && { creditorId }) } }).then((res) => res.data),
    ...listQueryOptions,
  });
};

export const useLoanDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.loans.detail(id),
    queryFn: () => api.get(`/api/loans/${id}`).then((res) => res.data),
  });
};

export const useCreateLoanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/api/loans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
    },
  });
};

export const useUpdateLoanMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put(`/api/loans/${id}`, data),
    onSuccess: (updatedLoan) => {
      // Update the item in all list caches
      updateInListCachesById(queryClient, queryKeys.loans.all, id, () => updatedLoan);
      // Update detail query
      queryClient.setQueryData(queryKeys.loans.detail(id), updatedLoan);
      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
    },
  });
};

export const useDeleteLoanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/loans/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove from all list caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.loans.all },
        (old: any) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.filter((item: any) => item.id !== deletedId),
          };
        }
      );
      // Remove detail query
      queryClient.removeQueries({ queryKey: queryKeys.loans.detail(deletedId) });
      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
    },
  });
};

// Payment Queries
export const usePaymentsQuery = (page = 1, limit = 10, search = '', loanId = '', creditorId = '', includeTotal = false) => {
  return useQuery({
    queryKey: queryKeys.payments.list(page, limit, search, loanId, creditorId, includeTotal),
    queryFn: () =>
      api.get('/api/payments', { params: { page, limit, search, includeTotal, ...(loanId && { loanId }), ...(creditorId && { creditorId }) } }).then((res) => res.data),
    ...listQueryOptions,
  });
};

export const usePaymentDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => api.get(`/api/payments/${id}`).then((res) => res.data),
  });
};

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/api/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
    },
  });
};

export const useUpdatePaymentMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put(`/api/payments/${id}`, data),
    onSuccess: (updatedPayment) => {
      // Update the item in all list caches
      updateInListCachesById(queryClient, queryKeys.payments.all, id, () => updatedPayment);
      // Update detail query
      queryClient.setQueryData(queryKeys.payments.detail(id), updatedPayment);
      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
    },
  });
};

export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/payments/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove from all list caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.payments.all },
        (old: any) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.filter((item: any) => item.id !== deletedId),
          };
        }
      );
      // Remove detail query
      queryClient.removeQueries({ queryKey: queryKeys.payments.detail(deletedId) });
      // Invalidate dependent queries
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all, refetchType: 'active' });
    },
  });
};

// Dashboard Queries
export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => api.get('/api/dashboard/summary').then((res) => res.data),
    staleTime: 3 * 60 * 1000, // 3 minutes - significantly reduced DB hits
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'stale',
  });
};

export const usePublicSettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings.public(),
    queryFn: () => api.get('/api/settings/public').then((res) => res.data),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useAdminSettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings.admin(),
    queryFn: () => api.get('/api/settings').then((res) => res.data),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put('/api/settings', data).then((res) => res.data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKeys.settings.admin(), updatedSettings);
      queryClient.setQueryData(queryKeys.settings.public(), updatedSettings);
    },
  });
};
