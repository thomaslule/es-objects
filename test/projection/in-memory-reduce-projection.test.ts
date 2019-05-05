import { InMemoryEventStorage, InMemoryReduceProjection } from "../../src";
import { catFedReducer, fedEvent } from "../util";

describe("InMemoryReduceProjection", () => {
  test("should be initialized with state if provided", () => {
    const proj = new InMemoryReduceProjection<boolean>(catFedReducer, true);
    expect(proj.getState()).toEqual(true);
  });

  test("should be initialized with init event if no state provided", () => {
    const proj = new InMemoryReduceProjection<boolean>(catFedReducer);
    expect(proj.getState()).toEqual(false);
  });

  test("should handle events", () => {
    const proj = new InMemoryReduceProjection<boolean>(catFedReducer);
    proj.handleEvent(fedEvent);
    expect(proj.getState()).toEqual(true);
  });

  test("rebuildStream should rebuild the projection from the events", async () => {
    const events = new InMemoryEventStorage([fedEvent]);
    const proj = new InMemoryReduceProjection<boolean>(catFedReducer);
    await new Promise(resolve =>
      events
        .getEvents("cat", "felix")
        .pipe(proj.rebuildStream())
        .on("finish", resolve)
    );
    expect(proj.getState()).toEqual(true);
  });
});
