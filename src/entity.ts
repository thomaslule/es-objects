import { makeDecisionReducer } from "./make-decision-reducer";
import { DecisionSequence, Event, Reducer } from "./types";

export abstract class Entity<TDecision> {

  constructor(
    private id: string,
    private decisionSequence: DecisionSequence<TDecision>,
    private publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
  ) {
  }

  protected abstract getAggregate(): string;

  protected abstract getDecisionReducer(): Reducer<TDecision>;

  protected getDecision(): TDecision {
    return this.decisionSequence.decision;
  }

  protected async publishAndApply(eventData: any): Promise<Event> {
    const event: Event = {
      ...eventData,
      aggregate: this.getAggregate(),
      id: this.id,
      sequence: this.decisionSequence.sequence + 1,
    };
    const newDecisionSequence = makeDecisionReducer(this.getDecisionReducer())(this.decisionSequence, event);
    await this.publish(event, newDecisionSequence);
    this.decisionSequence = newDecisionSequence;
    return event;
  }
}
