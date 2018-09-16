import { Projection } from "../src";
import { catFedReducer, fedEvent } from "./util";

describe("Projection", () => {
  test("should be initialized with state if provided", () => {
    const proj = new Projection(catFedReducer, { fed: true });
    expect(proj.getState()).toEqual({ fed: true });
  });

  test("should be initialized with init event if no state provided", () => {
    const proj = new Projection(catFedReducer);
    expect(proj.getState()).toEqual({ fed: false });
  });

  test("should handle events", () => {
    const proj = new Projection(catFedReducer);
    proj.handleEvent(fedEvent);
    expect(proj.getState()).toEqual({ fed: true });
  });
});
