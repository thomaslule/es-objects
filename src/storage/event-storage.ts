import { Stream } from "stream";
import { Event } from "../event";

export interface EventStorage {
  store: (event: Event) => void;
  getEvents: (aggregate: string, id: string, fromSequence?: number) => Stream;
  getAllEvents: () => Stream;
}
