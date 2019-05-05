import { makeDecisionReducer } from "../src";
import { catFedReducer, fedEvent } from "./util";

describe("makeDecisionReducer", () => {
  test("should add a sequence to the reducer", () => {
    const reducer = makeDecisionReducer(catFedReducer);

    const state = reducer(undefined, fedEvent);
    expect(state).toEqual({
      sequence: 0,
      decision: true
    });
  });
});
