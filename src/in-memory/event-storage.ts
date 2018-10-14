import { Readable } from "stream";
import { Event, EventStorage } from "../types";

const arrayToStream = (arr: any[]): Readable => {
  const stream = new Readable({ objectMode: true });
  arr.forEach((e) => { stream.push(e); });
  stream.push(null); // tslint:disable-line:no-null-keyword
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

  public getEvents(aggregate?: string, id?: string, fromSequence = -1) {
    const filter = ((e: Event) => {
      if (aggregate !== undefined && e.aggregate !== aggregate) { return false; }
      if (id !== undefined && e.id !== id) { return false; }
      if (fromSequence !== undefined && e.sequence < fromSequence) { return false; }
      return true;
    });
    return arrayToStream(this.events.filter(filter));
  }
}
