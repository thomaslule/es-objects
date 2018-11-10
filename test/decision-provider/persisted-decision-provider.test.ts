import {
  DecisionSequence, InMemoryEventStorage, InMemoryKeyValueStorage, PersistedDecisionProvider,
} from "../../src";
import { catFedReducer, fedEvent } from "../util";

describe("PersistedDecisionProvider", () => {
  let storage: InMemoryKeyValueStorage<DecisionSequence<boolean>>;
  let provider: PersistedDecisionProvider<boolean>;

  beforeEach(() => {
    storage = new InMemoryKeyValueStorage<DecisionSequence<boolean>>({
      felix: { sequence: 3, decision: true },
    });
    provider = new PersistedDecisionProvider("cat", catFedReducer, storage);
  });

  test("getDecisionSequence should retrieve the decision from the storage", async () => {
    const proj = await provider.getDecisionSequence("felix");
    expect(proj).toEqual({ sequence: 3, decision: true });
  });

  test("getDecisionSequence should initiate the default projection if not in storage", async () => {
    const proj = await provider.getDecisionSequence("molotov");
    expect(proj).toEqual({ sequence: -1, decision: false });
  });

  test("handleEvent should store the decision", async () => {
    await provider.handleEvent({ ...fedEvent, id: "molotov", sequence: 15 }, { sequence: 15, decision: true});
    const storedDecision = await storage.get("molotov");
    expect(storedDecision).toEqual({ sequence: 15, decision: true});
  });

  test("rebuildStream should rebuild the provider", async () => {
    storage = new InMemoryKeyValueStorage<DecisionSequence<boolean>>();
    provider = new PersistedDecisionProvider("cat", catFedReducer, storage);
    const events = new InMemoryEventStorage([fedEvent]);

    await new Promise((resolve) => events.getEvents().pipe(provider.rebuildStream()).on("finish", resolve));

    const proj = await provider.getDecisionSequence("felix");
    expect(proj).toEqual({ sequence: 0, decision: true });
  });
});
