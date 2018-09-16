import { ValueStorage } from "../storage/value-storage";

export class InMemoryValueStorage<T> implements ValueStorage<T> {
  constructor(private value?: T) {
  }

  public async get() {
    return this.value;
  }

  public async store(newValue: T) {
    this.value = newValue;
  }
}
