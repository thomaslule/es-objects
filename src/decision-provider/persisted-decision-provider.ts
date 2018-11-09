import { makeDecisionReducer } from "../make-decision-reducer";
import { PersistedEntityReduceProjection } from "../projection/persisted-entity-reduce-projection";
import {
  DecisionProvider, DecisionSequence, Event, KeyValueStorage, Rebuildable, Reducer,
} from "../types";

export class PersistedDecisionProvider<T> implements DecisionProvider<T>, Rebuildable {
  private decisionProjection: PersistedEntityReduceProjection<DecisionSequence<T>>;
  private reducerWithSequence: Reducer<DecisionSequence<T>>;

  constructor(aggregate: string, reducer: Reducer<T>, private storage: KeyValueStorage<DecisionSequence<T>>) {
    this.reducerWithSequence = makeDecisionReducer<T>(reducer);
    this.decisionProjection = new PersistedEntityReduceProjection(
      this.reducerWithSequence,
      this.storage,
      (event) => event.aggregate === aggregate,
    );
  }

  public async getDecisionSequence(id: string): Promise<DecisionSequence<T>> {
    return await this.decisionProjection.getState(id);
  }

  public async handleEvent(event: Event, decision: DecisionSequence<T>) {
    await this.storage.store(event.id, decision);
  }

  public rebuildStream() {
    return this.decisionProjection.rebuildStream();
  }
}
