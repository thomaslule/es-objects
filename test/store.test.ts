import { EventBus, InMemoryEventStorage, InMemoryKeyValueStorage, PersistedDecisionProvider, Store } from "../src";
import { Cat, catFedReducer } from "./util";

describe("Store", () => {
  let store: Store<Cat, boolean>;
  let decisionProvider: PersistedDecisionProvider<boolean>;
  let publish;

  beforeEach(() => {
    decisionProvider = new PersistedDecisionProvider("cat", catFedReducer, new InMemoryKeyValueStorage({
      felix: { sequence: 1, decision: true},
    }));
    publish = jest.fn().mockReturnValue(Promise.resolve());
    store = new Store(
      (id, decisionSequence, publish) => new Cat(id, decisionSequence, publish),
      decisionProvider,
      publish,
    );
  });

  test("get should create an entity with its decision retrieved from the provider", async () => {
    const felix = await store.get("felix");
    await expect(felix.feed()).rejects.toThrow("cat already fed!");
  });

  test("get should create an entity that can publish an event", async () => {
    const molotov = await store.get("molotov");

    await molotov.feed();
    await molotov.pet();

    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish.mock.calls[0][0]).toEqual({
      aggregate: "cat",
      id: "molotov",
      sequence: 0,
      type: "fed",
    });
    expect(publish.mock.calls[1][0]).toEqual({
      aggregate: "cat",
      id: "molotov",
      sequence: 1,
      type: "pet",
    });
  });

  test("get should create an entity that notifies the DecisionProvider on publish", async () => {
    const molotov = await store.get("molotov");

    await molotov.pet();
    const decisionProjection1 = await decisionProvider.getDecisionSequence("molotov");
    expect(decisionProjection1).toEqual({ sequence: 0, decision: false});

    await molotov.feed();
    const decisionProjection2 = await decisionProvider.getDecisionSequence("molotov");
    expect(decisionProjection2).toEqual({ sequence: 1, decision: true});
  });

  test(
    "on duplicate event sequence, the entity command should throw and the projections should not be updated",
    async () => {
      const bus = new EventBus(new InMemoryEventStorage());
      const storeWithEventBus = new Store(
        (id, decisionSequence, publish) => new Cat(id, decisionSequence, publish),
        decisionProvider,
        (event) => bus.publish(event),
      );

      // get 2 instances of the same entity
      const molotov = await storeWithEventBus.get("molotov");
      const molotov2 = await storeWithEventBus.get("molotov");

      // publish an event for one of them
      await molotov.pet();
      // the second cannot publish an event
      await expect(molotov2.feed())
        .rejects.toEqual(new Error("an event with same aggregate, id and sequence already exists"));

      // the decision projection only got the published event
      const decisionProjection = await decisionProvider.getDecisionSequence("molotov");
      expect(decisionProjection).toEqual({ sequence: 0, decision: false});
    },
  );
});
