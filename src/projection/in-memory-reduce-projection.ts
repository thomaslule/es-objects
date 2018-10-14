import { Readable } from "stream";
import { Event, Rebuildable, Reducer } from "../types";
import { projectFromEvents } from "./project-from-events";

const INIT_EVENT = {
  aggregate: "__init__",
  id: "__init__",
  sequence: -1,
};

export class InMemoryReduceProjection<T> implements Rebuildable {
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

  public async rebuild(events: Readable) {
    this.state = await projectFromEvents(this.reducer, events);
  }
}
