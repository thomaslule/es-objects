import { Reducer } from "../types";

const INIT_EVENT = {
  aggregate: "__init__",
  id: "__init__",
  sequence: -1,
};

/**
 * Get the initial state of a reducer, the default value of its state parameter.
 *
 * @param reducer any reducer
 */
export function getInitialState<T>(reducer: Reducer<T>): T {
  return reducer(undefined, INIT_EVENT);
}
