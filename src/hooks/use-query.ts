import { use } from "react";
import type { CacheEntry, Query } from "../types/cache.types";

const MAX_CACHE_SIZE = 100;
const promiseCache = new Map<string, CacheEntry<unknown>>();
export function useQuery<T = unknown>({
  fn,
  key,
  cache = true,
  cacheTime = 300000,
}: {
  fn: () => Promise<T>;
  key: string;
  cache?: boolean;
  cacheTime?: number;
}) {
  if (!promiseCache.has(key)) {
    const entry = {
      promise: undefined as any,
      data: undefined,
      expiresAt: undefined,
    } as CacheEntry<T>;
    entry.promise = fn().then((res) => {
      entry.data = res;
      return res;
    });
    if (cache && promiseCache.size < MAX_CACHE_SIZE) {
      if (cacheTime) {
        entry.expiresAt = Date.now() + cacheTime;
        entry.timeoutId = setTimeout(() => {
          promiseCache.delete(key);
        }, cacheTime);
      }
      promiseCache.set(key, entry);
    }
  }

  const cacheEntry = promiseCache.get(key) as CacheEntry<T>;
  if (cacheEntry.data !== undefined) return cacheEntry.data;
  return use(cacheEntry.promise);
}

export function mutateQuery<T>(key: string, updater: (oldData: T) => T) {
  const cacheEntry = promiseCache.get(key) as CacheEntry<T>;
  if (cacheEntry?.data) {
    cacheEntry.data = updater(cacheEntry.data);
  }
}

export function invalidateQueries(queries: Query[]) {
  for (const { key, after } of queries) {
    const cacheEntry = promiseCache.get(key);
    if (!cacheEntry) continue;
    if (cacheEntry.timeoutId) clearTimeout(cacheEntry.timeoutId);
    if (after && after > 0) {
      cacheEntry.expiresAt = Date.now() + after;
      cacheEntry.timeoutId = setTimeout(() => promiseCache.delete(key), after);
    } else promiseCache.delete(key);
  }
}

export function extendCache(key: string, extraMs: number) {
  const cacheEntry = promiseCache.get(key);
  if (!cacheEntry || extraMs <= 0) return;
  const now = Date.now();
  cacheEntry.expiresAt =
    cacheEntry.expiresAt && cacheEntry.expiresAt > now
      ? cacheEntry.expiresAt + extraMs
      : now + extraMs;
  if (cacheEntry.timeoutId) clearTimeout(cacheEntry.timeoutId);
  cacheEntry.timeoutId = setTimeout(
    () => promiseCache.delete(key),
    cacheEntry.expiresAt - now
  );
}
