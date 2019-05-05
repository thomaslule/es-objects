import {
  InMemoryEventStorage,
  InMemoryValueStorage,
  PersistedReduceProjection
} from "../../src";
import { catFedReducer, fedEvent } from "../util";

describe("PersistedReduceProjection", () => {
  let storage: InMemoryValueStorage<boolean>;
  let storageEmpty: InMemoryValueStorage<boolean>;
  let projection: PersistedReduceProjection<boolean>;
  let projectionEmpty: PersistedReduceProjection<boolean>;

  beforeEach(() => {
    storage = new InMemoryValueStorage(true);
    storageEmpty = new InMemoryValueStorage();
    projection = new PersistedReduceProjection(
      catFedReducer,
      storage,
      e => e.aggregate === "cat"
    );
    projectionEmpty = new PersistedReduceProjection(
      catFedReducer,
      storageEmpty,
      e => e.aggregate === "cat"
    );
  });

  test("getState should get the state from storage", async () => {
    expect(await projection.getState()).toEqual(true);
  });

  test("getState should return the reducer's default state when not in storage", async () => {
    expect(await projectionEmpty.getState()).toEqual(false);
  });

  test("handleEvent should calculate and store the new state", async () => {
    await projectionEmpty.handleEvent(fedEvent);
    expect(await storageEmpty.get()).toEqual(true);
  });

  test("handleEvent should do nothing if the event doesnt match the filter", async () => {
    await projectionEmpty.handleEvent({ ...fedEvent, aggregate: "dog" });
    expect(await projectionEmpty.getState()).toEqual(false);
  });

  test("rebuildStream should rebuild the projection state", async () => {
    const events = new InMemoryEventStorage([fedEvent]);
    expect(await projectionEmpty.getState()).toEqual(false);

    const stream = events.getEvents().pipe(projectionEmpty.rebuildStream());

    await new Promise(resolve => {
      stream.on("finish", resolve);
    });
    expect(await projectionEmpty.getState()).toEqual(true);
  });

  test("rebuildStream should ignore events that dont match filter", async () => {
    const events = new InMemoryEventStorage([
      { ...fedEvent, aggregate: "dog" }
    ]);

    const stream = events.getEvents().pipe(projectionEmpty.rebuildStream());

    await new Promise(resolve => {
      stream.on("finish", resolve);
    });
    expect(await projectionEmpty.getState()).toEqual(false);
  });

  test("rebuildStream should delete projection if no event was found", async () => {
    const events = new InMemoryEventStorage();

    const stream = events.getEvents().pipe(projection.rebuildStream());

    await new Promise(resolve => {
      stream.on("finish", resolve);
    });
    expect(await projection.getState()).toEqual(false);
  });

  test("rebuildStream should emit an error if there was an error during storage", async () => {
    const events = new InMemoryEventStorage([fedEvent]);
    storage.store = () => {
      throw new Error();
    };
    projection = new PersistedReduceProjection(
      catFedReducer,
      storage,
      e => e.aggregate === "cat"
    );
    const onError = jest.fn();

    const stream = events
      .getEvents()
      .pipe(projection.rebuildStream())
      .on("error", onError);

    await new Promise(resolve => {
      stream.on("finish", resolve);
    });
    expect(onError).toHaveBeenCalled();
  });
});
