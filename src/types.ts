import { Readable, Writable } from "stream";

/**
 * An object used by an entity to get the current decision.
 */
export interface DecisionProvider<TDecision> {
  /**
   * Get the latest decision
   */
  getDecisionSequence: (id: string) => Promise<DecisionSequence<TDecision>>;

  /**
   * If present, this method must be called by any entity willing to publish a new event.
   */
  handleEvent?: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>;
}

/**
 * An object representing the current decision state and its sequence number.
 *
 * The sequence number is the one of the last event taken in account.
 */
export interface DecisionSequence<T> {
  decision: T;
  sequence: number;
}

export interface Dictionary<T> {
  [key: string]: T | undefined;
}

/**
 * Events are plain javascript objects, they have 3 mandatory properties (`aggregate`, `id` and `sequence`)
 * and as much custom properties that you need to describe what happened.
 */
export interface Event {

  /**
   * An event is always related to a specific aggregate.
   */
  readonly aggregate: string;

  /**
   * The id of the specific entity that emitted the event.
   */
  readonly id: string;

  /**
   * For each entity, events are sequentially numbered.
   */
  readonly sequence: number;

  /**
   * Any additional serializable properties.
   */
  readonly [x: string]: any;
}

export interface EventStorage {
  store: (event: Event) => Promise<void>;
  getEvents: (aggregate?: string, id?: string, fromSequence?: number) => Readable;
  getCurrentSequence: (aggregate: string, id: string) => Promise<number>;
}

export interface KeyValueStorage<T> {
  get: (id: string) => Promise<T | undefined>;
  store: (id: string, value: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
  getAll: () => Promise<Dictionary<T>>;
  deleteAll: () => Promise<void>;
}

export interface Rebuildable {
  rebuildStream: () => Writable;
}

export type Reducer<T> = (state: T | undefined, event: Event) => T;

export interface ValueStorage<T> {
  get: () => Promise<T | undefined>;
  store: (value: T) => Promise<void>;
  delete: () => Promise<void>;
}
