import { Reducer } from "../types";

const INIT_EVENT = {
  aggregate: "__init__",
  id: "__init__",
  sequence: -1,
};

export function getInitialState<T>(reducer: Reducer<T>): T {
  return reducer(undefined, INIT_EVENT);
}
