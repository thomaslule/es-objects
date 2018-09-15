import { Event } from "./event";

export type Reducer<T> = (state: T, event: Event) => T;
