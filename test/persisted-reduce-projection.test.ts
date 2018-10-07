import { EventBus, InMemoryEventStorage, InMemoryValueStorage, PersistedReduceProjection } from "../src";
import { catFedReducer, fedEvent, FedState } from "./util";

describe("PersistedReduceProjection", () => {
  let storage: InMemoryValueStorage<FedState>;
  let storageEmpty: InMemoryValueStorage<FedState>;
  let projection: PersistedReduceProjection<FedState>;
  let projectionEmpty: PersistedReduceProjection<FedState>;

  beforeEach(() => {
    storage = new InMemoryValueStorage({ fed: true });
    storageEmpty = new InMemoryValueStorage();
    projection = new PersistedReduceProjection(catFedReducer, storage, (e) => e.aggregate === "cat");
    projectionEmpty = new PersistedReduceProjection(catFedReducer, storageEmpty, (e) => e.aggregate === "cat");
  });

  test("getState should get the state from storage", async () => {
    expect(await projection.getState()).toEqual({ fed: true });
  });

  test("getState should return the reducer's default state when not in storage", async () => {
    expect(await projectionEmpty.getState()).toEqual({ fed: false });
  });

  test("handleEvent should calculate and store the new state", async () => {
    await projectionEmpty.handleEvent(fedEvent);
    expect(await storageEmpty.get()).toEqual({ fed: true });
  });

  test("handleEvent should do nothing if the event doesnt match the filter", async () => {
    await projectionEmpty.handleEvent({ ...fedEvent, aggregate: "dog" });
    expect(await projectionEmpty.getState()).toEqual({ fed: false });
  });

  test("getInMemoryProjection should return a Projection constructed with the state and the reducer", async () => {
    const proj = await projection.getInMemoryProjection();
    expect(proj.getState()).toEqual({ fed: true });
    const proj2 = await projectionEmpty.getInMemoryProjection();
    expect(proj2.getState()).toEqual({ fed: false });
    proj2.handleEvent(fedEvent);
    expect(proj2.getState()).toEqual({ fed: true });
  });

  test("storeState should directly store the new state", async () => {
    await projectionEmpty.storeState({ fed: true });
    expect(await storageEmpty.get()).toEqual({ fed: true });
  });

  test("getRebuilder should return a rebuilder that can rebuild the projection state", async () => {
    const rebuilder = projectionEmpty.getRebuilder();
    const bus = new EventBus(new InMemoryEventStorage([fedEvent]));

    expect(await projectionEmpty.getState()).toEqual({ fed: false });
    await bus.replayEvents([rebuilder]);
    expect(await projectionEmpty.getState()).toEqual({ fed: true });
  });

  test("getRebuilder object should ignore events that dont match filter", async () => {
    const rebuilder = projectionEmpty.getRebuilder();
    const bus = new EventBus(new InMemoryEventStorage([{ ...fedEvent, aggregate: "dog" }]));

    await bus.replayEvents([rebuilder]);
    expect(await projectionEmpty.getState()).toEqual({ fed: false });
  });
});
