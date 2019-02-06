import { Readable } from "stream";
import { consumeStream } from "../consume-stream";
import { Event, Reducer } from "../types";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

/**
 * Read a stream of events, pass them to a reducer, returns the final value as the promise resolves.
 *
 * @param reducer a reducer
 * @param events a stream of events
 */
export async function projectFromEvents<T>(reducer: Reducer<T>, events: Readable): Promise<T> {
  const projection = new InMemoryReduceProjection(reducer);
  await consumeStream(events, (event: Event) => {
    projection.handleEvent(event);
  });
  return projection.getState();
}
