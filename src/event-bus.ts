import { EventEmitter } from "events";
import { Event, EventStorage } from "./types";

export class EventBus extends EventEmitter {
  constructor(private eventStorage: EventStorage) {
    super();
  }

  public async publish(event: Event) {
    await this.eventStorage.store(event);
    this.emit("event", event);
  }

  public onEvent(handler: (event: Event) => void | Promise<void>) {
    this.on("event", async (event) => {
      try {
        await handler(event);
      } catch (err) {
        this.emit("error", err);
      }
    });
  }

  public onError(handler: (...args: any[]) => void) {
    this.on("error", handler);
  }
}
