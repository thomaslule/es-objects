import { Store, StoredDecisionProvider } from "../src";
import { InMemoryKeyValueStorage } from "../src/in-memory";
import { Cat, catFedReducer } from "./util";

describe("Store", () => {
  let store: Store<Cat>;
  let decisionProvider: StoredDecisionProvider;
  let publisher;

  beforeEach(() => {
    decisionProvider = new StoredDecisionProvider(catFedReducer, new InMemoryKeyValueStorage({
      felix: { sequence: 1, decision: { fed: true }},
    }));
    publisher = {
      publish: jest.fn().mockReturnValue(Promise.resolve()),
    };
    store = new Store("cat", Cat, decisionProvider, publisher);
  });

  test("get should create an Entity with its decision retrieved from the provider", async () => {
    const felix = await store.get("felix");
    expect(felix.isFed()).toBeTruthy();
  });

  test("get should create an Entity and listen to its published events and decision", async () => {
    const molotov = await store.get("molotov");
    await molotov.feed();

    const decProj = await decisionProvider.getDecisionProjection("molotov");
    expect(decProj.getState()).toEqual({ sequence: 0, decision: { fed: true }});
    expect(publisher.publish).toHaveBeenCalled();
    expect(publisher.publish.mock.calls[0][0]).toMatchObject({ type: "fed" });
  });
});
