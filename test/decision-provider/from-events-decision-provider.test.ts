import { FromEventsDecisionProvider, InMemoryEventStorage } from "../../src";
import { catFedReducer, fedEvent } from "../util";

describe("FromEventsDecisionProvider", () => {
  test("getDecisionSequence should calculate the decision from the events", async () => {
    const eventStorage = new InMemoryEventStorage([fedEvent]);
    const provider = new FromEventsDecisionProvider(
      "cat",
      catFedReducer,
      eventStorage
    );
    const proj = await provider.getDecisionSequence("felix");
    expect(proj).toEqual({ sequence: 0, decision: true });
  });

  test("getDecisionSequence should initiate the default projection if no events", async () => {
    const eventStorage = new InMemoryEventStorage();
    const provider = new FromEventsDecisionProvider(
      "cat",
      catFedReducer,
      eventStorage
    );
    const proj = await provider.getDecisionSequence("felix");
    expect(proj).toEqual({ sequence: -1, decision: false });
  });
});
