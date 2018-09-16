import { DecisionState } from "./decision-state";
import { Event } from "./event";
import { Projection } from "./projection";

export interface DecisionProvider {
  getDecisionProjection: (id: string) => Promise<Projection<DecisionState>>;
  handleEvent?: (event: Event, decision: DecisionState) => Promise<void>;
}
