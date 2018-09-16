import * as toArray from "stream-to-array";
import { Event, EventBus } from "../src";
import { InMemoryEventStorage } from "../src/in-memory";

describe("EventBus", () => {
  let storage: InMemoryEventStorage;
  let bus: EventBus;
  const event: Event = {
    aggregate: "cat",
    id: "felix",
    sequence: 0,
    insertDate: new Date("2018-01-01").toISOString(),
  };

  beforeEach(() => {
    storage = new InMemoryEventStorage();
    bus = new EventBus(storage);
  });

  test("publish shoud add the event to the storage", async () => {
    await bus.publish(event);

    const events = await toArray(storage.getAllEvents());
    expect(events).toEqual([event]);
  });

  test("onEvent should be called", async () => {
    const handler = jest.fn();
    bus.onEvent(handler);

    await bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  test("onAggregateEvent should be called on right aggregate", async () => {
    const handler = jest.fn();
    bus.onAggregateEvent("cat", handler);

    await bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  test("onAggregateEvent should not be called on wrong aggregate", async () => {
    const handler = jest.fn();
    bus.onAggregateEvent("dog", handler);

    await bus.publish(event);

    expect(handler).not.toHaveBeenCalled();
  });
});
