import { DecisionProvider } from "./decision-provider";
import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { InMemoryReduceProjection } from "./in-memory-reduce-projection";
import { makeDecisionReducer } from "./make-decision-reducer";
import { PersistedEntityReduceProjection } from "./persisted-entity-reduce-projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";

export class PersistedDecisionProvider<T> implements DecisionProvider<T> {
  private decisionProjection: PersistedEntityReduceProjection<DecisionSequence<T>>;

  constructor(reducer: Reducer<T>, storage: KeyValueStorage<DecisionSequence<T>>, eventFilter?: (e: Event) => boolean) {
    this.decisionProjection = new PersistedEntityReduceProjection(
      makeDecisionReducer<T>(reducer),
      storage,
      eventFilter,
    );
  }

  public async getDecisionProjection(id: string): Promise<InMemoryReduceProjection<DecisionSequence<T>>> {
    return this.decisionProjection.getInMemoryProjection(id);
  }

  public async handleEvent(event: Event, decision: DecisionSequence<T>) {
    await this.decisionProjection.storeState(event.id, decision);
  }

  public getRebuilder(): Rebuilder {
    return this.decisionProjection.getRebuilder();
  }
}
