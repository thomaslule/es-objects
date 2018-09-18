import { ValueStorage } from "../storage/value-storage";

export class InMemoryValueStorage<T> implements ValueStorage<T> {
  constructor(private value?: T) {
  }

  public async get(): Promise<T | undefined> {
    return this.value;
  }

  public async store(newValue: T) {
    this.value = newValue;
  }
}
