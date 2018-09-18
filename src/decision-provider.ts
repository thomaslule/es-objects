import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { Projection } from "./projection";

export interface DecisionProvider<TDecision> {
  getDecisionProjection: (id: string) => Promise<Projection<DecisionSequence<TDecision>>>;
  handleEvent?: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>;
}
