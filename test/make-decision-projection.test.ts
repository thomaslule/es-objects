import { makeDecisionProjection } from "../src";
import { catFedReducer, fedEvent } from "./util";

describe("makeDecisionProjection", () => {
  test("it should work when no state is provided", () => {
    const proj = makeDecisionProjection(catFedReducer);
    expect(proj.getState()).toEqual({ decision: { fed: false }, sequence: -1 });
    proj.handleEvent(fedEvent);
    expect(proj.getState()).toEqual({ decision: { fed: true }, sequence: 0 });
  });

  test("it should work when a state is provided without sequence", () => {
    const proj = makeDecisionProjection(catFedReducer, { fed: true });
    expect(proj.getState()).toEqual({ decision: { fed: true }, sequence: -1 });
    proj.handleEvent(fedEvent);
    expect(proj.getState()).toEqual({ decision: { fed: true }, sequence: 0 });
  });

  test("it should work when both state and sequence are provided", () => {
    const proj = makeDecisionProjection(catFedReducer, { fed: true }, 3);
    expect(proj.getState()).toEqual({ decision: { fed: true }, sequence: 3 });
    proj.handleEvent({ ...fedEvent, sequence: 4 });
    expect(proj.getState()).toEqual({ decision: { fed: true }, sequence: 4 });
  });
});
