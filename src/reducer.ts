import { Event } from "./event";

export type Reducer<T> = (state: T | undefined, event: Event) => T;
