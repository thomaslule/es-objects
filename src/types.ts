import { Readable } from "stream";
import { InMemoryReduceProjection } from "./projection/in-memory-reduce-projection";

export interface DecisionProvider<TDecision> {
  getDecisionProjection: (id: string) => Promise<InMemoryReduceProjection<DecisionSequence<TDecision>>>;
  handleEvent?: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>;
}

export interface DecisionSequence<T> {
  decision: T;
  sequence: number;
}

export interface Dictionary<T> {
  [key: string]: T | undefined;
}

export interface Event {
  readonly aggregate: string;
  readonly id: string;
  readonly sequence: number;
  readonly [x: string]: any;
}

export interface EventStorage {
  store: (event: Event) => Promise<void>;
  getEvents: (aggregate?: string, id?: string, fromSequence?: number) => Readable;
}

export interface KeyValueStorage<T> {
  get: (id: string) => Promise<T | undefined>;
  store: (id: string, value: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
  getAll: () => Promise<Dictionary<T>>;
  deleteAll: () => Promise<void>;
}

export interface Rebuildable {
  rebuild: (eventStream: Readable) => Promise<void>;
}

export type Reducer<T> = (state: T | undefined, event: Event) => T;

export interface ValueStorage<T> {
  get: () => Promise<T | undefined>;
  store: (value: T) => Promise<void>;
  delete: () => Promise<void>;
}
