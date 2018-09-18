import { DecisionSequence } from "./decision-sequence";
import { Reducer } from "./reducer";

export function makeDecisionReducer<T>(reducer: Reducer<T>): Reducer<DecisionSequence<T>> {
  return (state = { decision: undefined, sequence: -1 }, event) => ({
    decision: reducer(state.decision, event),
    sequence: event.sequence,
  });
}
