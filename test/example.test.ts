import {
  EventBus,
  InMemoryEventStorage,
  InMemoryKeyValueStorage,
  InMemoryValueStorage,
  Reducer,
  Store,
  StoredDecisionProvider,
  StoredEntityProjection,
  StoredProjection,
} from "../src";
import { Cat, catFedReducer, FedState } from "./util";

const nbMealsReducer: Reducer<number> = (state = 0, event) => {
  if (event.type === "fed") {
    return state + 1;
  }
  return state;
};

test("usage example", async () => {
  const bus = new EventBus(new InMemoryEventStorage());

  const catDecisionProvider = new StoredDecisionProvider(
    catFedReducer,
    new InMemoryKeyValueStorage(),
    (e) => e.aggregate === "cat",
  );
  const catStore = new Store<Cat, FedState>(
    (id, decisionProjection, publish) => new Cat(id, decisionProjection, publish),
    catDecisionProvider,
    bus,
  );

  const nbMealsServedProjection = new StoredProjection<number>(
    nbMealsReducer,
    new InMemoryValueStorage(),
    (e) => e.aggregate === "cat",
  );
  const catFedProjection = new StoredEntityProjection<FedState>(
    catFedReducer,
    new InMemoryKeyValueStorage(),
    (e) => e.aggregate === "cat",
  );

  bus.onEvent(async (event) => {
    try { await nbMealsServedProjection.handleEvent(event); } catch (err) { console.log(err); }
  });
  bus.onEvent(async (event) => {
    try { await catFedProjection.handleEvent(event); } catch (err) { console.log(err); }
  });

  const felix = await catStore.get("felix");
  await felix.feed();

  const nbCatsFed = await nbMealsServedProjection.getState();
  expect(nbCatsFed).toBe(1);

  const felixFed = await catFedProjection.getState("felix");
  expect(felixFed).toEqual({ fed: true });
});
