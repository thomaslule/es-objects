import { InMemoryEventStorage, InMemoryKeyValueStorage, PersistedEntityReduceProjection } from "../../src";
import { catFedReducer, fedEvent, FedState } from "../util";

describe("PersistedEntityReduceProjection", () => {
  let projection: PersistedEntityReduceProjection<FedState>;
  let storage: InMemoryKeyValueStorage<FedState>;

  beforeEach(() => {
    storage = new InMemoryKeyValueStorage({ felix: { fed: true }});
    projection = new PersistedEntityReduceProjection(catFedReducer, storage, (e) => e.aggregate === "cat");
  });

  test("getState should get the state from storage", async () => {
    expect(await projection.getState("felix")).toEqual({ fed: true });
  });

  test("getState should return the reducer's default state when not in storage", async () => {
    expect(await projection.getState("molotov")).toEqual({ fed: false });
  });

  test("handleEvent should calculate and store the new state", async () => {
    await projection.handleEvent({ ...fedEvent, id: "molotov" });
    expect(await storage.get("molotov")).toEqual({ fed: true });
  });

  test("handleEvent should ignore events that dont match the filter", async () => {
    await projection.handleEvent({ ...fedEvent, aggregate: "dog", id: "molotov" });
    expect(await projection.getState("molotov")).toEqual({ fed: false });
  });

  test("getAll should get all states from storage", async () => {
    await projection.handleEvent({ ...fedEvent, id: "molotov" });
    expect(await projection.getAll()).toEqual({ felix: { fed: true }, molotov: { fed: true }});
  });

  test("rebuildStream should rebuild the projection state", async () => {
    const emptyStorage = new InMemoryKeyValueStorage<FedState>();
    projection = new PersistedEntityReduceProjection<FedState>(
      catFedReducer,
      emptyStorage,
      (e) => e.aggregate === "cat",
    );
    const events = new InMemoryEventStorage([fedEvent, { ...fedEvent, aggregate: "dog", id: "rex" }]);

    await new Promise((resolve) => events.getEvents().pipe(projection.rebuildStream()).on("finish", resolve));

    expect(await projection.getState("felix")).toEqual({ fed: true });
    expect(await projection.getState("rex")).toEqual({ fed: false }); // event doesn't match filter
  });

  test("rebuildStream should empty the state if no event was replayed", async () => {
    const events = new InMemoryEventStorage();
    await new Promise((resolve) => events.getEvents().pipe(projection.rebuildStream()).on("finish", resolve));
    expect(await projection.getState("felix")).toEqual({ fed: false });
  });
});
