import { makeDecisionReducer } from "../src";
import { catFedReducer, fedEvent, FedState } from "./util";

describe("makeDecisionReducer", () => {
  test("should add a sequence to the reducer", () => {
    const reducer = makeDecisionReducer<FedState>(catFedReducer);

    const state = reducer(undefined, fedEvent);
    expect(state).toEqual({
      sequence: 0,
      decision: { fed: true },
    });
  });
});
