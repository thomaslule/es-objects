import { Writable } from "stream";
import { Event, Rebuildable, Reducer, ValueStorage } from "../types";
import { getInitialState } from "./get-initial-state";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

/**
 * A projection that stores its latest state in a storage.
 *
 * ```typescript
 * const projection = new PersistedReduceProjection(nbMealsReducer);
 * bus.onEvent((event) => projection.handleEvent(event));
 * const nbMeals = await projection.getState();
 * ```
 */
export class PersistedReduceProjection<T> implements Rebuildable {
  constructor(
    private reducer: Reducer<T>,
    private storage: ValueStorage<T>,
    private eventFilter: (e: Event) => boolean = (e) => true) {
  }

  public async handleEvent(event: Event) {
    if (this.eventFilter(event)) {
      const state = await this.storage.get();
      const newState = this.reducer(state, event);
      await this.storage.store(newState);
    }
  }

  public async getState() {
    const state = await this.storage.get();
    return state !== undefined ? state : getInitialState(this.reducer);
  }

  public rebuildStream() {
    const proj = new InMemoryReduceProjection(this.reducer);
    const { storage, eventFilter } = this;
    return new Writable({
      objectMode: true,
      write(data, encoding, callback) {
        try {
          if (eventFilter(data)) { proj.handleEvent(data); }
          callback();
        } catch (err) {
          callback(err);
        }
      },
      async final(callback) {
        try {
          await storage.store(proj.getState());
          callback();
        } catch (err) {
          callback(err);
        }
      },
    });
  }
}
