import { DecisionSequence } from "./decision-sequence";
import { Reducer } from "./reducer";

export function makeDecisionReducer(reducer: Reducer<any>): Reducer<DecisionSequence> {
  return (state = { decision: undefined, sequence: -1 }, event) => ({
    decision: reducer(state.decision, event),
    sequence: event.sequence,
  });
}
