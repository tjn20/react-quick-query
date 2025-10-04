export interface CacheEntry<T> {
  promise: Promise<T>;
  data?: T;
  expiresAt?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export interface Query {
  key: string;
  after?: number;
}
