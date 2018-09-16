import { EventEmitter } from "events";
import { consumeStream } from "./consume-stream";
import { Event } from "./event";
import { EventPublisher } from "./event-publisher";
import { Rebuilder } from "./rebuilder";
import { EventStorage } from "./storage/event-storage";

export class EventBus implements EventPublisher {
  private bus = new EventEmitter();

  constructor(private eventStorage: EventStorage) {
  }

  public onEvent(handler: (event: Event) => void) {
    this.bus.on("event", handler);
  }

  public onAggregateEvent(aggregate: string, handler: (event: Event) => void) {
    this.bus.on("event", (event) => {
      if (event.aggregate === aggregate) { handler(event); }
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
