export interface KeyValueStorage<T> {
  get: (id: string) => Promise<T | undefined>;
  store: (id: string, value: T) => Promise<void>;
}
