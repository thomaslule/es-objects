import { Event } from "./event";
import { Reducer } from "./reducer";

const INIT_EVENT = {
  aggregate: "__init__",
  id: "__init__",
  sequence: -1,
  insertDate: new Date("1970-01-01").toISOString(),
};

export class Projection<T> {
  constructor(private reducer: Reducer<T>, private state?) {
    if (this.state === undefined) {
      this.handleEvent(INIT_EVENT);
    }
  }

  public handleEvent(event: Event): void {
    this.state = this.reducer(this.state, event);
  }

  public getState(): T {
    return this.state;
  }
}
