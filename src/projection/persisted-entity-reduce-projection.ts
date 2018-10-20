import { Readable } from "stream";
import { consumeStream } from "../consume-stream";
import { Dictionary, Event, KeyValueStorage, Rebuildable, Reducer } from "../types";
import { getInitialState } from "./get-initial-state";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

export class PersistedEntityReduceProjection<T> implements Rebuildable {
  constructor(
    private reducer: Reducer<T>,
    private storage: KeyValueStorage<T>,
    private eventFilter: (e: Event) => boolean = (e) => true) {
  }

  public async handleEvent(event: Event) {
    if (this.eventFilter(event)) {
      const state = await this.getState(event.id);
      const newState = this.reducer(state, event);
      await this.storage.store(event.id, newState);
    }
  }

  public async getState(id: string): Promise<T> {
    const state = await this.storage.get(id);
    return state !== undefined ? state : getInitialState(this.reducer);
  }

  public async getAll(): Promise<Dictionary<T>> {
    return this.storage.getAll();
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
}
