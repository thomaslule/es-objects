import { Dictionary, KeyValueStorage } from "../types";

export class InMemoryKeyValueStorage<T> implements KeyValueStorage<T> {
  constructor(private values: Dictionary<T> = {}) {}

  public async get(id: string): Promise<T | undefined> {
    return this.values[id];
  }

  public async store(id: string, value: T) {
    this.values[id] = value;
  }

  public async delete(id: string) {
    delete this.values[id];
  }

  public async getAll() {
    return this.values;
  }

  public async deleteAll() {
    this.values = {};
  }
}
