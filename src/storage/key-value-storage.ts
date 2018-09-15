export interface KeyValueStorage<T> {
  get: (id: string) => Promise<T>;
  store: (id: string, value: T) => Promise<void>;
}
