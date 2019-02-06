import { Writable } from "stream";
import { Event, Rebuildable, Reducer } from "../types";
import { getInitialState } from "./get-initial-state";

/**
 * A projection that stores its latest state in memory so you can access it synchronously.
 *
 * ```typescript
 * const projection = new InMemoryReduceProjection(nbMealsReducer);
 * bus.onEvent((event) => projection.handleEvent(event));
 * const nbMeals = projection.getState();
 * ```
 */
export class InMemoryReduceProjection<T> implements Rebuildable {

  constructor(private reducer: Reducer<T>, private state: T = getInitialState(reducer)) {
  }

  public handleEvent(event: Event): void {
    this.state = this.reducer(this.state, event);
  }

  public getState(): T {
    return this.state;
  }

  public rebuildStream() {
    this.state = getInitialState(this.reducer);
    const handleEvent = (e: Event) => this.handleEvent(e);
    return new Writable({
      objectMode: true,
      write(data, encoding, callback) {
        try {
          handleEvent(data);
          callback();
        } catch (err) {
          callback(err);
        }
      },
    });
  }
}
