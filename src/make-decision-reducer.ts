import { DecisionSequence, Reducer } from "./types";

/**
 * Create a reducer that returns a {@link DecisionSequence} object whose sequence is retrieved from the event flow and
 * decision is calculated by the given reducer.
 *
 * @param reducer the reducer that calculates the decision object
 * @returns a {@link DecisionSequence} {@link Reducer}
 */
export function makeDecisionReducer<T>(reducer: Reducer<T>): Reducer<DecisionSequence<T>> {
  return (state, event) => ({
    decision: reducer(state ? state.decision : undefined, event),
    sequence: event.sequence,
  });
}
