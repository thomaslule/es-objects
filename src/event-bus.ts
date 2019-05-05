import { EventEmitter } from "events";
import { Event, EventStorage } from "./types";

/**
 * The `EventEmitter` that stores and publishes events.
 *
 * ```typescript
 * const bus = new EventBus(new InMemoryEventStorage());
 * bus.onError((err) => { console.error(err); });
 * bus.onEvent((event) => { console.log(`Something happened: ${event}`); });
 * bus.publish({ aggregate: 'cat', id: 'felix', sequence: 0, type: 'fed' });
 * ```
 */
export class EventBus extends EventEmitter {
  /**
   * Instanciate the bus with an underlying `EventStorage`.
   *
   * @param eventStorage where your events will be stored.
   */
  constructor(private eventStorage: EventStorage) {
    super();
  }

  /**
   * When you `publish` an event, it is first stored in the EventStorage then it is emitted to every subscribers.
   *
   * @param event the event to publish
   */
  public async publish(event: Event) {
    await this.eventStorage.store(event);
    this.emit("event", event);
  }

  /**
   * The handler is called for every published event.
   *
   * If the handler throws or returns a rejecting promise, an `error` will be emitted.
   *
   * @param handler event handler
   */
  public onEvent(handler: (event: Event) => void | Promise<void>) {
    this.on("event", async event => {
      try {
        await handler(event);
      } catch (err) {
        this.emit("error", err);
      }
    });
  }

  /**
   * Listen to `error`. You really should write at least one error handler because `EventBus` is an instance of
   * `EventEmitter`, if it emits an `error` while no listener is attached, it throws.
   *
   * @param handler error handler
   */
  public onError(handler: (...args: any[]) => void) {
    this.on("error", handler);
  }
}
