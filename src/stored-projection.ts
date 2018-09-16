import { Event } from "./event";
import { Projection } from "./projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { ValueStorage } from "./storage/value-storage";

export class StoredProjection<T> {
  constructor(private reducer: Reducer<T>, private storage: ValueStorage<T>) {
  }

  public async handleEvent(event: Event) {
    const proj = await this.getProjection();
    proj.handleEvent(event);
    await this.storeState(proj.getState());
  }

  public async getState() {
    return (await this.getProjection()).getState();
  }

  public async getProjection() {
    const state = await this.storage.get();
    return new Projection(this.reducer, state);
  }

  public async storeState(state: T) {
    await this.storage.store(state);
  }

  public getRebuilder(): Rebuilder {
    return new StoredProjectionRebuilder(this.reducer, this.storage);
  }
}

class StoredProjectionRebuilder<T> implements Rebuilder {
  private projection: Projection<T>;
  constructor(reducer: Reducer<T>, private storage: ValueStorage<T>) {
    this.projection = new Projection(reducer);
  }

  public handleEvent(event: Event) {
    this.projection.handleEvent(event);
  }

  public async finalize() {
    await this.storage.store(this.projection.getState());
  }
}
