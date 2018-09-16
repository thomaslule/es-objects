import { StoredEntityProjection } from "../src";
import { InMemoryKeyValueStorage } from "../src/in-memory";
import { catFedReducer, fedEvent, FedState } from "./util";

describe("StoredEntityProjection", () => {
  let projection: StoredEntityProjection<FedState>;
  let storage: InMemoryKeyValueStorage<FedState>;

  beforeEach(() => {
    storage = new InMemoryKeyValueStorage({ felix: { fed: true }});
    projection = new StoredEntityProjection(catFedReducer, storage);
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

  test("getProjection should return a Projection constructed with the state and the reducer", async () => {
    const proj = await projection.getProjection("felix");
    expect(proj.getState()).toEqual({ fed: true });
    const proj2 = await projection.getProjection("molotov");
    proj2.handleEvent(fedEvent);
    expect(proj2.getState()).toEqual({ fed: true });
  });

  test("storeState should directly store the new state", async () => {
    await projection.storeState("molotov", { fed: true });
    expect(await storage.get("molotov")).toEqual({ fed: true });
  });
});
