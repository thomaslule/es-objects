import { Event } from "./event";
import { Projection } from "./projection";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";
import { ValueStorage } from "./storage/value-storage";
import { StoredProjection } from "./stored-projection";

export class StoredEntityProjection<T> {
  constructor(private reducer: Reducer<T>, private storage: KeyValueStorage<T>) {
  }

  public async handleEvent(event: Event) {
    await this.getStoredProjectionFor(event.id).handleEvent(event);
  }

  public async getState(id: string): Promise<T> {
    return this.getStoredProjectionFor(id).getState();
  }

  public async getProjection(id: string): Promise<Projection<T>> {
    return this.getStoredProjectionFor(id).getProjection();
  }

  public async storeState(id: string, state: T) {
    await this.getStoredProjectionFor(id).storeState(state);
  }

  private getStoredProjectionFor(id: string): StoredProjection<T> {
    return new StoredProjection(this.reducer, this.getStorageFor(id));
  }

  private getStorageFor(id: string): ValueStorage<T> {
    return {
      get: () => this.storage.get(id),
      store: (state) => this.storage.store(id, state),
    };
  }
}
