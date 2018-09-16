import { StoredDecisionProvider } from "../src";
import { DecisionState } from "../src/decision-state";
import { InMemoryKeyValueStorage } from "../src/in-memory";
import { catFedReducer, fedEvent } from "./util";

describe("StoredDecisionProvider", () => {
  let storage: InMemoryKeyValueStorage<DecisionState>;
  let provider: StoredDecisionProvider;

  beforeEach(() => {
    storage = new InMemoryKeyValueStorage<DecisionState>({
      felix: { sequence: 3, decision: { fed: true } },
    });
    provider = new StoredDecisionProvider(catFedReducer, storage);
  });

  test("getDecisionProjection should retrieve the decision from the storage", async () => {
    const proj = await provider.getDecisionProjection("felix");
    expect(proj.getState()).toEqual({ sequence: 3, decision: { fed: true } });
  });

  test("getDecisionProjection should initiate the default projection if not in storage", async () => {
    const proj = await provider.getDecisionProjection("molotov");
    expect(proj.getState()).toEqual({ sequence: -1, decision: { fed: false } });
  });

  test("handleEvent should store the decision", async () => {
    await provider.handleEvent({ ...fedEvent, id: "molotov", sequence: 15 }, { sequence: 15, decision: { fed: true }});
    const storedDecision = await storage.get("molotov");
    expect(storedDecision).toEqual({ sequence: 15, decision: { fed: true }});
  });
});
