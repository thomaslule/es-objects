import { InMemoryReduceProjection } from "../projection/in-memory-reduce-projection";
import { DecisionSequence, Event } from "../types";

export interface DecisionProvider<TDecision> {
  getDecisionProjection: (id: string) => Promise<InMemoryReduceProjection<DecisionSequence<TDecision>>>;
  handleEvent?: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>;
}
