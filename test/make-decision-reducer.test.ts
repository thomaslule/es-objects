import { Event, makeDecisionReducer } from "../src";

const event: Event = {
  aggregate: "cat",
  id: "felix",
  sequence: 5,
  insertDate: new Date("2018-01-01").toISOString(),
};

describe("makeDecisionReducer", () => {
  test("should add a sequence to the reducer", () => {
    const originalReducer = (state, event) => ({
      custom: true,
    });

    const reducer = makeDecisionReducer(originalReducer);

    const state = reducer(undefined, event);
    expect(state).toEqual({
      sequence: 5,
      decision: { custom: true },
    });
  });
});
