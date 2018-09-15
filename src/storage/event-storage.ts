import { Event } from "../event";

export interface EventStorage {

  store: (event: Event) => void;

}
