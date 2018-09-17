import { DecisionProvider } from "./decision-provider";
import { DecisionState } from "./decision-state";
import { Event } from "./event";
import { makeDecisionReducer } from "./make-decision-reducer";
import { Projection } from "./projection";
import { Rebuilder } from "./rebuilder";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";
import { StoredEntityProjection } from "./stored-entity-projection";

export class StoredDecisionProvider implements DecisionProvider {
  private storedProjection: StoredEntityProjection<DecisionState>;

  constructor(reducer: Reducer<any>, storage: KeyValueStorage<DecisionState>, eventFilter?: (e: Event) => boolean) {
    this.storedProjection = new StoredEntityProjection(makeDecisionReducer(reducer), storage, eventFilter);
  }

  public async getDecisionProjection(id: string): Promise<Projection<DecisionState>> {
    return this.storedProjection.getProjection(id);
  }

  public async handleEvent(event: Event, decision: DecisionState) {
    await this.storedProjection.storeState(event.id, decision);
  }

  public getRebuilder(): Rebuilder {
    return this.storedProjection.getRebuilder();
  }
}
