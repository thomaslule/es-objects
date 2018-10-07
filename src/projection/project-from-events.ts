import { Stream } from "stream";
import { consumeStream } from "../consume-stream";
import { Event, Reducer } from "../types";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";

export async function projectFromEvents<T>(reducer: Reducer<T>, events: Stream): Promise<T> {
  const projection = new InMemoryReduceProjection(reducer);
  await consumeStream(events, (event: Event) => {
    projection.handleEvent(event);
  });
  return projection.getState();
}
