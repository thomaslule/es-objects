import { Writable } from "stream";
import {
  Dictionary,
  Event,
  KeyValueStorage,
  Rebuildable,
  Reducer
} from "../types";
import { getInitialState } from "./get-initial-state";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

/**
 * A projection that stores a state for each entity in its storage.
 *
 * ```typescript
 * const projection = new PersistedEntityReduceProjection(catFedReducer, storage);
 * bus.onEvent((event) => projection.handleEvent(event));
 * const felixFed = await projection.getState("felix");
 * ```
 */
export class PersistedEntityReduceProjection<T> implements Rebuildable {
  constructor(
    private reducer: Reducer<T>,
    private storage: KeyValueStorage<T>,
    private eventFilter: (e: Event) => boolean = e => true
  ) {}

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

  public rebuildStream() {
    const projections: Dictionary<InMemoryReduceProjection<T>> = {};
    const eventFilter = (event: Event) => this.eventFilter(event);
    const { reducer, storage } = this;
    return new Writable({
      objectMode: true,
      write(event, encoding, callback) {
        try {
          if (eventFilter(event)) {
            if (!projections[event.id]) {
              projections[event.id] = new InMemoryReduceProjection<T>(reducer);
            }
            (projections[event.id] as InMemoryReduceProjection<T>).handleEvent(
              event
            );
          }
          callback();
        } catch (err) {
          callback(err);
        }
      },
      async final(callback) {
        try {
          await storage.deleteAll();
          const promises = Object.entries(projections).map(([id, projection]) =>
            storage.store(
              id,
              (projection as InMemoryReduceProjection<T>).getState()
            )
          );
          await Promise.all(promises);
          callback();
        } catch (err) {
          callback(err);
        }
      }
    });
  }
}
