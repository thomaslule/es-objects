import { Readable } from "stream";
import { consumeStream } from "../consume-stream";
import { Dictionary, Event, KeyValueStorage, Rebuildable, Reducer, ValueStorage } from "../types";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";
import { PersistedReduceProjection } from "./persisted-reduce-projection";

export class PersistedEntityReduceProjection<T> implements Rebuildable {
  constructor(
    private reducer: Reducer<T>,
    private storage: KeyValueStorage<T>,
    private eventFilter: (e: Event) => boolean = (e) => true) {
  }

  public async handleEvent(event: Event) {
    await this.getProjectionFor(event.id).handleEvent(event);
  }

  public async getState(id: string): Promise<T> {
    return this.getProjectionFor(id).getState();
  }

  public async getAll(): Promise<Dictionary<T>> {
    return this.storage.getAll();
  }

  public async getInMemoryProjection(id: string): Promise<InMemoryReduceProjection<T>> {
    return this.getProjectionFor(id).getInMemoryProjection();
  }

  public async storeState(id: string, state: T) {
    await this.getProjectionFor(id).storeState(state);
  }

  public async rebuild(eventStream: Readable) {
    await this.storage.deleteAll();
    const projections: Dictionary<InMemoryReduceProjection<T>> = {};
    await consumeStream(eventStream, (event) => {
      if (this.eventFilter(event)) {
        if (!projections[event.id]) {
          projections[event.id] = new InMemoryReduceProjection<T>(this.reducer);
        }
        (projections[event.id] as InMemoryReduceProjection<T>).handleEvent(event);
      }
    });
    const promises = Object.entries(projections)
      .map(([id, projection]) => this.storage.store(id, (projection as InMemoryReduceProjection<T>).getState()));
    await Promise.all(promises);
  }

  private getProjectionFor(id: string): PersistedReduceProjection<T> {
    return new PersistedReduceProjection(this.reducer, this.getStorageFor(id), this.eventFilter);
  }

  private getStorageFor(id: string): ValueStorage<T> {
    return {
      get: () => this.storage.get(id),
      store: (state) => this.storage.store(id, state),
      delete: () => this.storage.delete(id),
    };
  }
}
