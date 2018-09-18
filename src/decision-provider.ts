import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { Projection } from "./projection";

export interface DecisionProvider {
  getDecisionProjection: (id: string) => Promise<Projection<DecisionSequence>>;
  handleEvent?: (event: Event, decision: DecisionSequence) => Promise<void>;
}
