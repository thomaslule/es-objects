import { DecisionSequence, Reducer } from "./types";

export function makeDecisionReducer<T>(reducer: Reducer<T>): Reducer<DecisionSequence<T>> {
  return (state, event) => ({
    decision: reducer(state ? state.decision : undefined, event),
    sequence: event.sequence,
  });
}
