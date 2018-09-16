import { DecisionState } from "./decision-state";
import { Reducer } from "./reducer";

export function makeDecisionReducer(reducer: Reducer<any>): Reducer<DecisionState> {
  return (state = { decision: undefined, sequence: -1 }, event) => ({
    decision: reducer(state.decision, event),
    sequence: event.sequence,
  });
}
