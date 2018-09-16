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

  test("publish should add the event to the storage", async () => {
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

  test("replayEvents should call handleEvent for each event then call finalize", async () => {
    await storage.store(fedEvent);
    const fedEvent2 = { ...fedEvent, id: "molotov" };
    await storage.store(fedEvent2);
    const rebuilder = {
      handleEvent: jest.fn(),
      finalize: jest.fn(),
    };

    await bus.replayEvents([rebuilder]);

    expect(rebuilder.handleEvent).toHaveBeenCalledTimes(2);
    expect(rebuilder.handleEvent.mock.calls[0][0]).toEqual(fedEvent);
    expect(rebuilder.handleEvent.mock.calls[1][0]).toEqual(fedEvent2);
    expect(rebuilder.finalize).toHaveBeenCalled();
  });
});
