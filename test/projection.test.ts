import { Event, Projection } from "../src";

const catReducer = (state = { fed: false }, event) => {
  if (event.type === "feed") {
    return { fed: true };
  }
  return state;
};

const feedEvent: Event = {
  aggregate: "cat",
  id: "felix",
  sequence: 0,
  insertDate: new Date("2018-01-01").toISOString(),
  type: "feed",
};

describe("Projection", () => {
  test("should be initialized with state if provided", () => {
    const proj = new Projection(catReducer, { fed: true });
    expect(proj.getState()).toEqual({ fed: true });
  });

  test("should be initialized with init event if no state provided", () => {
    const proj = new Projection(catReducer);
    expect(proj.getState()).toEqual({ fed: false });
  });

  test("should handle events", () => {
    const proj = new Projection(catReducer);
    proj.handleEvent(feedEvent);
    expect(proj.getState()).toEqual({ fed: true });
  });
});
