import { Event } from "./event";
import { Projection } from "./projection";
import { Reducer } from "./reducer";
import { ValueStorage } from "./storage/value-storage";

export class StoredProjection<T> {
  constructor(private reducer: Reducer<T>, private storage: ValueStorage<T>) {
  }

  public async handleEvent(event: Event) {
    const proj = await this.getProjection();
    proj.handleEvent(event);
    await this.storage.store(proj.getState());
  }

  public async getState() {
    return (await this.getProjection()).getState();
  }

  private async getProjection() {
    const state = await this.storage.get();
    return new Projection(this.reducer, state);
  }
}
