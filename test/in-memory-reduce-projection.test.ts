import { InMemoryReduceProjection } from "../src";
import { catFedReducer, fedEvent, FedState } from "./util";

describe("InMemoryReduceProjection", () => {
  test("should be initialized with state if provided", () => {
    const proj = new InMemoryReduceProjection<FedState>(catFedReducer, { fed: true });
    expect(proj.getState()).toEqual({ fed: true });
  });

  test("should be initialized with init event if no state provided", () => {
    const proj = new InMemoryReduceProjection<FedState>(catFedReducer);
    expect(proj.getState()).toEqual({ fed: false });
  });

  test("should handle events", () => {
    const proj = new InMemoryReduceProjection<FedState>(catFedReducer);
    proj.handleEvent(fedEvent);
    expect(proj.getState()).toEqual({ fed: true });
  });
});
