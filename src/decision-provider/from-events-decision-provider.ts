import { makeDecisionReducer } from "../make-decision-reducer";
import { projectFromEvents } from "../projection/project-from-events";
import {
  DecisionProvider,
  DecisionSequence,
  EventStorage,
  Reducer
} from "../types";

/**
 * A {@link DecisionProvider} that stores nothing in memory: to provide a decision,
 * it reads the event stream of the aggregate.
 */
export class FromEventsDecisionProvider<TDecision>
  implements DecisionProvider<TDecision> {
  private reducer: Reducer<DecisionSequence<TDecision>>;

  /**
   * @param aggregate the aggregate name
   * @param reducer the decision reducer
   * @param eventStorage the event store
   */
  constructor(
    private aggregate: string,
    reducer: Reducer<TDecision>,
    private eventStorage: EventStorage
  ) {
    this.reducer = makeDecisionReducer(reducer);
  }

  /**
   * Get the latest {@link DecisionSequence} for an entity.
   *
   * @param id the entity's id
   */
  public async getDecisionSequence(
    id: string
  ): Promise<DecisionSequence<TDecision>> {
    return await projectFromEvents(
      this.reducer,
      this.eventStorage.getEvents(this.aggregate, id)
    );
  }
}
