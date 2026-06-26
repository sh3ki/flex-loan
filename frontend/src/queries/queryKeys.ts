const baseKeys = {
  query: ['query'] as const,
};

export const queryKeys = {
  all: baseKeys.query,
  creditors: {
    all: [...baseKeys.query, 'creditors'] as const,
    list: (page: number, limit: number, search?: string, status?: string) =>
      [...baseKeys.query, 'creditors', 'list', page, limit, search, status] as const,
    detail: (id: string) => [...baseKeys.query, 'creditors', 'detail', id] as const,
  },
  loans: {
    all: [...baseKeys.query, 'loans'] as const,
    list: (page: number, limit: number, search?: string, status?: string, creditorId?: string) =>
      [...baseKeys.query, 'loans', 'list', page, limit, search, status, creditorId] as const,
    detail: (id: string) => [...baseKeys.query, 'loans', 'detail', id] as const,
  },
  payments: {
    all: [...baseKeys.query, 'payments'] as const,
    list: (page: number, limit: number, search?: string, loanId?: string, creditorId?: string) =>
      [...baseKeys.query, 'payments', 'list', page, limit, search, loanId, creditorId] as const,
    detail: (id: string) => [...baseKeys.query, 'payments', 'detail', id] as const,
  },
  dashboard: {
    all: [...baseKeys.query, 'dashboard'] as const,
    summary: () => [...baseKeys.query, 'dashboard', 'summary'] as const,
  },
  collections: {
    all: [...baseKeys.query, 'collections'] as const,
  },
  settings: {
    all: [...baseKeys.query, 'settings'] as const,
    public: () => [...baseKeys.query, 'settings', 'public'] as const,
    admin: () => [...baseKeys.query, 'settings', 'admin'] as const,
  },
  notifications: {
    all: [...baseKeys.query, 'notifications'] as const,
    list: () => [...baseKeys.query, 'notifications', 'list'] as const,
    unread: () => [...baseKeys.query, 'notifications', 'unread'] as const,
    unreadCount: () => [...baseKeys.query, 'notifications', 'unreadCount'] as const,
  },
};
