import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { InMemoryReduceProjection } from "./projection/in-memory-reduce-projection";

export interface DecisionProvider<TDecision> {
  getDecisionProjection: (id: string) => Promise<InMemoryReduceProjection<DecisionSequence<TDecision>>>;
  handleEvent?: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>;
}
