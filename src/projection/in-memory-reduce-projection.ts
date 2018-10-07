import { Event, Reducer } from "../types";

const INIT_EVENT = {
  aggregate: "__init__",
  id: "__init__",
  sequence: -1,
};

export class InMemoryReduceProjection<T> {
  private state: T;

  constructor(private reducer: Reducer<T>, state?: T) {
    if (state === undefined) {
      this.state = reducer(undefined, INIT_EVENT);
    } else {
      this.state = state;
    }
  }

  public handleEvent(event: Event): void {
    this.state = this.reducer(this.state, event);
  }

  public getState(): T {
    return this.state;
  }
}
