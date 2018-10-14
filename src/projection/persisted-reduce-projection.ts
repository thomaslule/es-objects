import { Readable } from "stream";
import { consumeStream } from "../consume-stream";
import { Event, Rebuildable, Reducer, ValueStorage } from "../types";
import { getInitialState } from "./get-initial-state";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

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

  public async rebuild(eventStream: Readable) {
    await this.storage.delete();
    const proj = new InMemoryReduceProjection(this.reducer);
    await consumeStream(eventStream, (event) => {
      if (this.eventFilter(event)) {
        proj.handleEvent(event);
      }
    });
    await this.storage.store(proj.getState());
  }
}
