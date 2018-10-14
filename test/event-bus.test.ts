import * as toArray from "stream-to-array";
import { EventBus, InMemoryEventStorage } from "../src";
import { fedEvent } from "./util";

describe("EventBus", () => {
  let storage: InMemoryEventStorage;
  let bus: EventBus;
  let errorHandler: (...args: any[]) => any;

  beforeEach(() => {
    storage = new InMemoryEventStorage();
    errorHandler = jest.fn();
    bus = new EventBus(storage, errorHandler);
  });

  test("publish should add the event to the storage", async () => {
    await bus.publish(fedEvent);

    const events = await toArray(storage.getEvents());
    expect(events).toEqual([fedEvent]);
  });

  test("onEvent should be called", async () => {
    const handler = jest.fn();
    bus.onEvent(handler);

    await bus.publish(fedEvent);

    expect(handler).toHaveBeenCalledWith(fedEvent);
  });

  test("onEventHandler catch sync handler errors", async () => {
    bus.onEvent(() => {
      throw new Error("any error");
    });
    await bus.publish(fedEvent);
    expect(errorHandler).toHaveBeenCalledWith(new Error("any error"));
  });

  test("onEventHandler catch async handler errors", async () => {
    bus.onEvent(async () => {
      throw new Error("any error");
    });
    await bus.publish(fedEvent);
    await Promise.resolve();
    expect(errorHandler).toHaveBeenCalledWith(new Error("any error"));
  });
});
