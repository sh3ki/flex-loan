type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class TtlCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

export const appCache = new TtlCache();

export const cacheKeys = {
  dashboardSummary: (userId: string) => `dashboard:summary:${userId}`,
  collectionsSummary: (userId: string) => `collections:summary:${userId}`,
  systemSettingsPublic: () => 'system:settings:public',
  systemSettingsAdmin: () => 'system:settings:admin',
};