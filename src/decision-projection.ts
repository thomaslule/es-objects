import { DecisionState } from "./decision-state";
import { Reducer } from "./reducer";
import { KeyValueStorage } from "./storage/key-value-storage";
import { StoredEntityProjection } from "./stored-entity-projection";

export class DecisionProjection extends StoredEntityProjection<DecisionState> {
  constructor(reducer: Reducer<any>, storage: KeyValueStorage<DecisionState>) {
    const reducerWithSeq = (state, event) => ({ decision: reducer(state, event), sequence: event.sequence });
    super(reducerWithSeq, storage);
  }
}
