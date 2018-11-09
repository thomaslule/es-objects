import { makeDecisionReducer } from "./make-decision-reducer";
import { InMemoryReduceProjection } from "./projection/in-memory-reduce-projection";
import { Reducer } from "./types";

export function makeDecisionProjection<T>(reducer: Reducer<T>, decision?: T, sequence = -1) {
  return new InMemoryReduceProjection(makeDecisionReducer(reducer), decision ? { decision, sequence } : undefined);
}
