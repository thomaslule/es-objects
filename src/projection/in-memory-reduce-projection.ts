import { Readable } from "stream";
import { Event, Rebuildable, Reducer } from "../types";
import { getInitialState } from "./get-initial-state";
import { projectFromEvents } from "./project-from-events";

export class InMemoryReduceProjection<T> implements Rebuildable {
  constructor(private reducer: Reducer<T>, private state: T = getInitialState(reducer)) {
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
