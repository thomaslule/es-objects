import { makeDecisionReducer } from "../make-decision-reducer";
import { PersistedEntityReduceProjection } from "../projection/persisted-entity-reduce-projection";
import {
  DecisionProvider,
  DecisionSequence,
  Event,
  KeyValueStorage,
  Rebuildable,
  Reducer
} from "../types";

/**
 * A {@link DecisionProvider} that persists the latest {@link DecisionSequence} in a storage everytime an event happens.
 */
export class PersistedDecisionProvider<T>
  implements DecisionProvider<T>, Rebuildable {
  private decisionProjection: PersistedEntityReduceProjection<
    DecisionSequence<T>
  >;
  private reducerWithSequence: Reducer<DecisionSequence<T>>;

  /**
   * @param aggregate the aggregate name
   * @param reducer the decision reducer
   * @param storage where to persist our decision projections
   */
  constructor(
    aggregate: string,
    reducer: Reducer<T>,
    private storage: KeyValueStorage<DecisionSequence<T>>
  ) {
    this.reducerWithSequence = makeDecisionReducer<T>(reducer);
    this.decisionProjection = new PersistedEntityReduceProjection(
      this.reducerWithSequence,
      this.storage,
      event => event.aggregate === aggregate
    );
  }

  /**
   * Get the latest {@link DecisionSequence} for an entity.
   *
   * @param id the entity's id
   */
  public async getDecisionSequence(id: string): Promise<DecisionSequence<T>> {
    return await this.decisionProjection.getState(id);
  }

  /**
   * Update the persisted decision.
   *
   * @param event the event that triggered the decision change
   * @param decision the new decision to store
   */
  public async handleEvent(event: Event, decision: DecisionSequence<T>) {
    await this.storage.store(event.id, decision);
  }

  /**
   * Gets the Writable stream that rebuilds the persisted decision from a stream of {@link Events}.
   */
  public rebuildStream() {
    return this.decisionProjection.rebuildStream();
  }
}
