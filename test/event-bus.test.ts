import * as toArray from "stream-to-array";
import { EventBus } from "../src";
import { InMemoryEventStorage } from "../src/in-memory";
import { fedEvent } from "./util";

describe("EventBus", () => {
  let storage: InMemoryEventStorage;
  let bus: EventBus;

  beforeEach(() => {
    storage = new InMemoryEventStorage();
    bus = new EventBus(storage);
  });

  test("publish shoud add the event to the storage", async () => {
    await bus.publish(fedEvent);

    const events = await toArray(storage.getAllEvents());
    expect(events).toEqual([fedEvent]);
  });

  test("onEvent should be called", async () => {
    const handler = jest.fn();
    bus.onEvent(handler);

    await bus.publish(fedEvent);

    expect(handler).toHaveBeenCalledWith(fedEvent);
  });

  test("onAggregateEvent should be called on right aggregate", async () => {
    const handler = jest.fn();
    bus.onAggregateEvent("cat", handler);

    await bus.publish(fedEvent);

    expect(handler).toHaveBeenCalledWith(fedEvent);
  });

  test("onAggregateEvent should not be called on wrong aggregate", async () => {
    const handler = jest.fn();
    bus.onAggregateEvent("dog", handler);

    await bus.publish(fedEvent);

    expect(handler).not.toHaveBeenCalled();
  });
});
