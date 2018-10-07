import { consumeStream } from "../consume-stream";
import { DecisionSequence } from "../decision-sequence";
import { Event } from "../event";
import { makeDecisionReducer } from "../make-decision-reducer";
import { InMemoryReduceProjection } from "../projection/in-memory-reduce-projection";
import { Reducer } from "../reducer";
import { EventStorage } from "../storage/event-storage";
import { DecisionProvider } from "./decision-provider";

export class FromEventsDecisionProvider<T> implements DecisionProvider<T> {
  constructor(private aggregate: string, private reducer: Reducer<T>, private eventStorage: EventStorage) {
  }

  public async getDecisionProjection(id: string): Promise<InMemoryReduceProjection<DecisionSequence<T>>> {
    const projection = new InMemoryReduceProjection(makeDecisionReducer(this.reducer));
    await consumeStream(this.eventStorage.getEvents(this.aggregate, id), (event: Event) => {
      projection.handleEvent(event);
    });
    return projection;
  }

}
