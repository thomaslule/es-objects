import { DecisionSequence } from "./decision-sequence";
import { Reducer } from "./reducer";

export function makeDecisionReducer<T>(reducer: Reducer<T>): Reducer<DecisionSequence<T>> {
  return (state, event) => ({
    decision: reducer(state ? state.decision : undefined, event),
    sequence: event.sequence,
  });
}
