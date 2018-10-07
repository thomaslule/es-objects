import { Stream } from "stream";
import { Event } from "../event";
import { EventStorage } from "../storage/event-storage";

const arrayToStream = (arr: any[]): Stream => {
  const stream = new Stream.Readable({ objectMode: true });
  arr.forEach((e) => { stream.push(e); });
  stream.push(null);
  return stream;
};

const duplicate = (e1: Event, e2: Event) =>
  e1.aggregate === e2.aggregate && e1.id === e2.id && e1.sequence === e2.sequence;

export class InMemoryEventStorage implements EventStorage {
  constructor(private events: Event[] = []) {
  }

  public async store(event: Event) {
    if (this.events.filter((e) => duplicate(e, event)).length) {
      throw new Error("an event with same aggregate, id and sequence already exists");
    }
    this.events.push(event);
  }

  public getAllEvents() {
    return arrayToStream(this.events);
  }
}
