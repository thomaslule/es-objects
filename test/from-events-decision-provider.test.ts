import { FromEventsDecisionProvider, InMemoryEventStorage } from "../src";
import { catFedReducer, fedEvent } from "./util";

describe("FromEventsDecisionProvider", () => {
  test("getDecisionProjection should calculate the decision from the events", async () => {
    const eventStorage = new InMemoryEventStorage([fedEvent]);
    const provider = new FromEventsDecisionProvider("cat", catFedReducer, eventStorage);
    const proj = await provider.getDecisionProjection("felix");
    expect(proj.getState()).toEqual({ sequence: 0, decision: { fed: true } });
  });

  test("getDecisionProjection should initiate the default projection if no events", async () => {
    const eventStorage = new InMemoryEventStorage();
    const provider = new FromEventsDecisionProvider("cat", catFedReducer, eventStorage);
    const proj = await provider.getDecisionProjection("felix");
    expect(proj.getState()).toEqual({ sequence: -1, decision: { fed: false } });
  });
});
