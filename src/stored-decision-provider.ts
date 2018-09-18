import { DecisionProvider } from "./decision-provider";
import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { makeDecisionReducer } from "./make-decision-reducer";
import { Projection } from "./projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";
import { StoredEntityProjection } from "./stored-entity-projection";

export class StoredDecisionProvider<T> implements DecisionProvider<T> {
  private storedProjection: StoredEntityProjection<DecisionSequence<T>>;

  constructor(reducer: Reducer<T>, storage: KeyValueStorage<DecisionSequence<T>>, eventFilter?: (e: Event) => boolean) {
    this.storedProjection = new StoredEntityProjection(makeDecisionReducer<T>(reducer), storage, eventFilter);
  }

  public async getDecisionProjection(id: string): Promise<Projection<DecisionSequence<T>>> {
    return this.storedProjection.getProjection(id);
  }

  public async handleEvent(event: Event, decision: DecisionSequence<T>) {
    await this.storedProjection.storeState(event.id, decision);
  }

  public getRebuilder(): Rebuilder {
    return this.storedProjection.getRebuilder();
  }
}
