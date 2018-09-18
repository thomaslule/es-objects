export interface ValueStorage<T> {
  get: () => Promise<T | undefined>;
  store: (value: T) => Promise<void>;
}
