import { Event } from "./event";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { ValueStorage } from "./storage/value-storage";

export class PersistedReduceProjection<T> {
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

  public getRebuilder(): Rebuilder {
    return new PersistedReduceProjectionRebuilder(this.reducer, this.storage, this.eventFilter);
  }
}

class PersistedReduceProjectionRebuilder<T> implements Rebuilder {
  private projection: InMemoryReduceProjection<T>;
  constructor(reducer: Reducer<T>, private storage: ValueStorage<T>, private eventFilter: (e: Event) => boolean) {
    this.projection = new InMemoryReduceProjection(reducer);
  }

  public handleEvent(event: Event) {
    if (this.eventFilter(event)) {
      this.projection.handleEvent(event);
    }
  }

  public async finalize() {
    await this.storage.store(this.projection.getState());
  }
}
