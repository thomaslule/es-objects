import { EventEmitter } from "events";
import { consumeStream } from "./consume-stream";
import { Event, EventStorage, Rebuilder } from "./types";

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

  public async replayEvents(rebuilders: Rebuilder[]) {
    await consumeStream(this.eventStorage.getAllEvents(), async (event: Event) => {
      await rebuilders.map((r) => r.handleEvent(event));
    });
    await Promise.all(rebuilders.map((r) => r.finalize()));
  }
}
