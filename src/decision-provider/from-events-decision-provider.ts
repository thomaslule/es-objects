import { makeDecisionReducer } from "../make-decision-reducer";
import { projectFromEvents } from "../projection/project-from-events";
import { DecisionProvider, DecisionSequence, EventStorage, Reducer } from "../types";

export class FromEventsDecisionProvider<T> implements DecisionProvider<T> {
  private reducer: Reducer<DecisionSequence<T>>;

  constructor(private aggregate: string, reducer: Reducer<T>, private eventStorage: EventStorage) {
    this.reducer = makeDecisionReducer(reducer);
  }

  public async getDecisionSequence(id: string): Promise<DecisionSequence<T>> {
    return await projectFromEvents(this.reducer, this.eventStorage.getEvents(this.aggregate, id));
  }

}
