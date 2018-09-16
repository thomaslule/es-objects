import { Event } from "./event";

export interface Rebuilder {
  handleEvent: (event: Event) => void | Promise<void>;
  finalize: () => Promise<void>;
}
