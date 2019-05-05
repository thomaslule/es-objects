import { ValueStorage } from "../types";

export class InMemoryValueStorage<T> implements ValueStorage<T> {
  constructor(private value?: T) {}

  public async get(): Promise<T | undefined> {
    return this.value;
  }

  public async store(newValue: T) {
    this.value = newValue;
  }

  public async delete() {
    this.value = undefined;
  }
}
