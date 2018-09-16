import {
  Entity, EventBus, Reducer, Store, StoredDecisionProvider, StoredEntityProjection, StoredProjection,
} from "../src";
import { InMemoryEventStorage, InMemoryKeyValueStorage, InMemoryValueStorage } from "../src/in-memory";

const decisionReducer: Reducer<any> = (state = { registered: false }, event) => {
  if (event.type === "registered") {
    return { registered: true };
  }
  return state;
};

interface Identity { name?: string; }

const identityReducer: Reducer<Identity> = (state = {}, event) => {
  if (event.type === "registered") {
    return { name: event.name };
  }
  return state;
};

const nbUsersReducer: Reducer<number> = (state = 0, event) => {
  if (event.type === "registered") {
    return state + 1;
  }
  return state;
};

class User extends Entity {
  public async register(name) {
    if (this.getDecision().registered) {
      throw new Error("user already registered");
    }
    await this.publishAndApply({ type: "registered", name });
  }
}

test("usage example", async () => {
  const bus = new EventBus(new InMemoryEventStorage());

  const userDecisionProvider = new StoredDecisionProvider(decisionReducer, new InMemoryKeyValueStorage());
  const userStore = new Store<User>("user", User, userDecisionProvider, bus);

  const nbUsersProjection = new StoredProjection<number>(nbUsersReducer, new InMemoryValueStorage());
  const identityProjection = new StoredEntityProjection<Identity>(
    identityReducer,
    new InMemoryKeyValueStorage(),
  );

  bus.onAggregateEvent("user", async (event) => {
    try { await nbUsersProjection.handleEvent(event); } catch (err) { console.log(err); }
  });
  bus.onAggregateEvent("user", async (event) => {
    try { await identityProjection.handleEvent(event); } catch (err) { console.log(err); }
  });

  const user = await userStore.get("user123");
  await user.register("John Doe");

  const nbUsers = await nbUsersProjection.getState();
  expect(nbUsers).toBe(1);

  const identity = await identityProjection.getState("user123");
  expect(identity).toEqual({ name: "John Doe" });
});
