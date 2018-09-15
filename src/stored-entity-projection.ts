import { Event } from "./event";
import { Projection } from "./projection";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";

export class StoredEntityProjection<T> {
  constructor(private reducer: Reducer<T>, private storage: KeyValueStorage<T>) {
  }

  public async handleEvent(event: Event) {
    const proj = await this.getProjection(event.id);
    proj.handleEvent(event);
    await this.storeState(event.id, proj.getState());
  }

  public async getState(id: string) {
    const proj = await this.getProjection(id);
    return proj.getState();
  }

  public async getProjection(id: string) {
    const state = await this.storage.get(id);
    return new Projection(this.reducer, state);
  }

  public async storeState(id: string, state: T) {
    await this.storage.store(id, state);
  }
}
