import { Readable } from "stream";
import { makeDecisionReducer } from "../make-decision-reducer";
import { InMemoryReduceProjection } from "../projection/in-memory-reduce-projection";
import { PersistedEntityReduceProjection } from "../projection/persisted-entity-reduce-projection";
import { DecisionProvider, DecisionSequence, Event, KeyValueStorage, Rebuildable, Reducer } from "../types";

export class PersistedDecisionProvider<T> implements DecisionProvider<T>, Rebuildable {
  private decisionProjection: PersistedEntityReduceProjection<DecisionSequence<T>>;

  constructor(aggregate: string, reducer: Reducer<T>, private storage: KeyValueStorage<DecisionSequence<T>>) {
    this.decisionProjection = new PersistedEntityReduceProjection(
      makeDecisionReducer<T>(reducer),
      this.storage,
      (event) => event.aggregate === aggregate,
    );
  }

  public async getDecisionProjection(id: string): Promise<InMemoryReduceProjection<DecisionSequence<T>>> {
    return this.decisionProjection.getInMemoryProjection(id);
  }

  public async handleEvent(event: Event, decision: DecisionSequence<T>) {
    await this.storage.store(event.id, decision);
  }

  public async rebuild(eventStream: Readable) {
    await this.decisionProjection.rebuild(eventStream);
  }
}
