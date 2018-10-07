import { DecisionSequence } from "../decision-sequence";
import { Event } from "../event";
import { makeDecisionReducer } from "../make-decision-reducer";
import { InMemoryReduceProjection } from "../projection/in-memory-reduce-projection";
import { PersistedEntityReduceProjection } from "../projection/persisted-entity-reduce-projection";
import { Rebuilder } from "../rebuilder";
import { Reducer } from "../reducer";
import { KeyValueStorage } from "../storage/key-value-storage";
import { DecisionProvider } from "./decision-provider";

export class PersistedDecisionProvider<T> implements DecisionProvider<T> {
  private decisionProjection: PersistedEntityReduceProjection<DecisionSequence<T>>;

  constructor(aggregate: string, reducer: Reducer<T>, storage: KeyValueStorage<DecisionSequence<T>>) {
    this.decisionProjection = new PersistedEntityReduceProjection(
      makeDecisionReducer<T>(reducer),
      storage,
      (event) => event.aggregate === aggregate,
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
