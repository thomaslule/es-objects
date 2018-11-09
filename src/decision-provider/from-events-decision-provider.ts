import { makeDecisionReducer } from "../make-decision-reducer";
import { InMemoryReduceProjection } from "../projection/in-memory-reduce-projection";
import { projectFromEvents } from "../projection/project-from-events";
import { DecisionProjection, DecisionProvider, DecisionSequence, EventStorage, Reducer } from "../types";

export class FromEventsDecisionProvider<T> implements DecisionProvider<T> {
  private reducer: Reducer<DecisionSequence<T>>;

  constructor(private aggregate: string, reducer: Reducer<T>, private eventStorage: EventStorage) {
    this.reducer = makeDecisionReducer(reducer);
  }

  public async getDecisionProjection(id: string): Promise<DecisionProjection<T>> {
    const state = await projectFromEvents(this.reducer, this.eventStorage.getEvents(this.aggregate, id));
    return new InMemoryReduceProjection(this.reducer, state);
  }

}
