export interface ValueStorage<T> {
  get: () => Promise<T>;
  store: (T) => Promise<void>;
}
