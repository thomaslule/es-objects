import { EventEmitter } from "events";
import { Event, EventStorage } from "./types";

export class EventBus {
  private bus = new EventEmitter();

  constructor(private eventStorage: EventStorage, private errorHandler: (err: any) => void = () => {}) {
  }

  public onEvent(handler: (event: Event) => void | Promise<void>) {
    this.bus.on("event", async (event: Event) => {
      try {
        await handler(event);
      } catch (err) {
        this.errorHandler(err);
      }
    });
  }

  public async publish(event: Event) {
    await this.eventStorage.store(event);
    this.bus.emit("event", event);
  }
}
