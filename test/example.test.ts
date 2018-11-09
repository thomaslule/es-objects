import {
  EventBus,
  FromEventsDecisionProvider,
  InMemoryEventStorage,
  InMemoryKeyValueStorage,
  InMemoryValueStorage,
  PersistedEntityReduceProjection,
  PersistedReduceProjection,
  Reducer,
  Store,
} from "../src";
import { Cat, catFedReducer, FedState } from "./util";

const nbMealsReducer: Reducer<number> = (state = 0, event) => {
  if (event.type === "fed") {
    return state + 1;
  }
  return state;
};

test("usage example", async () => {
  const eventStorage = new InMemoryEventStorage();
  const bus = new EventBus(eventStorage);
  bus.on("error", (err) => { console.error(err); });

  const catDecisionProvider = new FromEventsDecisionProvider("cat", catFedReducer, eventStorage);

  const catStore = new Store<Cat, FedState>(
    (id, decisionProjection, publish) => new Cat(id, decisionProjection, publish),
    catDecisionProvider,
    (event) => bus.publish(event),
  );

  const nbMealsServedProjection = new PersistedReduceProjection<number>(
    nbMealsReducer,
    new InMemoryValueStorage(),
    (e) => e.aggregate === "cat",
  );
  const catFedProjection = new PersistedEntityReduceProjection<FedState>(
    catFedReducer,
    new InMemoryKeyValueStorage(),
    (e) => e.aggregate === "cat",
  );

  bus.onEvent(async (event) => { await nbMealsServedProjection.handleEvent(event); });
  bus.onEvent(async (event) => { await catFedProjection.handleEvent(event); });

  const felix = await catStore.get("felix");
  await felix.feed();

  const nbCatsFed = await nbMealsServedProjection.getState();
  expect(nbCatsFed).toBe(1);

  const felixFed = await catFedProjection.getState("felix");
  expect(felixFed).toEqual({ fed: true });
});
