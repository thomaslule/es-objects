import { Readable } from "stream";
import { Event, Rebuildable, Reducer, ValueStorage } from "../types";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

export class PersistedReduceProjection<T> implements Rebuildable {
  constructor(
    private reducer: Reducer<T>,
    private storage: ValueStorage<T>,
    private eventFilter: (e: Event) => boolean = (e) => true) {
  }

  public async handleEvent(event: Event) {
    if (this.eventFilter(event)) {
      const proj = await this.getInMemoryProjection();
      proj.handleEvent(event);
      await this.storeState(proj.getState());
    }
  }

  public async getState() {
    return (await this.getInMemoryProjection()).getState();
  }

  public async getInMemoryProjection() {
    const state = await this.storage.get();
    return new InMemoryReduceProjection(this.reducer, state);
  }

  public async storeState(state: T) {
    await this.storage.store(state);
  }

  public async rebuild(eventStream: Readable) {
    return new Promise<void>((resolve, reject) => {
      const proj = new InMemoryReduceProjection(this.reducer);
      eventStream.on("data", (event) => {
        if (this.eventFilter(event)) {
          proj.handleEvent(event);
        }
      });
      eventStream.on("end", async () => {
        try {
          await this.storeState(proj.getState());
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
