import { Event } from "./event";
import { Projection } from "./projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";
import { ValueStorage } from "./storage/value-storage";
import { StoredProjection } from "./stored-projection";

export class StoredEntityProjection<T> {
  constructor(
    private reducer: Reducer<T>,
    private storage: KeyValueStorage<T>,
    private eventFilter: (e: Event) => boolean = (e) => true) {
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

  public getRebuilder(): Rebuilder {
    return new StoredEntityProjectionRebuilder(this.reducer, this.storage, this.eventFilter);
  }

  private getStoredProjectionFor(id: string): StoredProjection<T> {
    return new StoredProjection(this.reducer, this.getStorageFor(id), this.eventFilter);
  }

  private getStorageFor(id: string): ValueStorage<T> {
    return {
      get: () => this.storage.get(id),
      store: (state) => this.storage.store(id, state),
    };
  }
}

class StoredEntityProjectionRebuilder<T> implements Rebuilder {
  private projections: { [id: string]: Projection<T> } = {};

  constructor(
    private reducer: Reducer<T>,
    private storage: KeyValueStorage<T>,
    private eventFilter: (e: Event) => boolean,
  ) {
  }

  public handleEvent(event: Event) {
    if (this.eventFilter(event)) {
      if (!this.projections[event.id]) {
        this.projections[event.id] = new Projection<T>(this.reducer);
      }
      this.projections[event.id].handleEvent(event);
    }
  }

  public async finalize() {
    const promises = Object.entries(this.projections)
      .map(([id, projection]) => this.storage.store(id, projection.getState()));
    await Promise.all(promises);
  }
}
