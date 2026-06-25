import { QueryClient } from '@tanstack/react-query';

interface ListCacheShape<T> {
  data?: T[];
  [key: string]: any;
}

type CacheUpdater<T> = (item: T) => T;

export function prependToListCaches<T>(
  queryClient: QueryClient,
  queryKeyPrefix: readonly unknown[],
  item: T,
  maxItemsPerPage?: number
) {
  queryClient.setQueriesData(
    { queryKey: queryKeyPrefix },
    (old: ListCacheShape<T> | undefined) => {
      if (!old || !Array.isArray(old.data)) return old;

      const nextItems = [item, ...old.data];
      const trimmedItems =
        typeof maxItemsPerPage === 'number' && maxItemsPerPage > 0
          ? nextItems.slice(0, maxItemsPerPage)
          : nextItems;

      return {
        ...old,
        data: trimmedItems,
      };
    }
  );
}

export function updateInListCachesById<T extends { id: string }>(
  queryClient: QueryClient,
  queryKeyPrefix: readonly unknown[],
  id: string,
  updater: CacheUpdater<T>
) {
  queryClient.setQueriesData(
    { queryKey: queryKeyPrefix },
    (old: ListCacheShape<T> | undefined) => {
      if (!old || !Array.isArray(old.data)) return old;

      return {
        ...old,
        data: old.data.map((item) => (item.id === id ? updater(item) : item)),
      };
    }
  );
}

export function removeFromListCachesById<T extends { id: string }>(
  queryClient: QueryClient,
  queryKeyPrefix: readonly unknown[],
  id: string
) {
  queryClient.setQueriesData(
    { queryKey: queryKeyPrefix },
    (old: ListCacheShape<T> | undefined) => {
      if (!old || !Array.isArray(old.data)) return old;

      return {
        ...old,
        data: old.data.filter((item) => item.id !== id),
      };
    }
  );
}