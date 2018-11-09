import { makeDecisionReducer } from "./make-decision-reducer";
import { DecisionSequence, Event, Reducer } from "./types";

export abstract class Entity<TDecision> {
  private decisionSequenceReducer: Reducer<DecisionSequence<TDecision>>;

  constructor(
    private id: string,
    private decisionSequence: DecisionSequence<TDecision>,
    private publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
  ) {
    this.decisionSequenceReducer = makeDecisionReducer(this.getReducer());
  }

  protected abstract getAggregate(): string;

  protected abstract getReducer(): Reducer<TDecision>;

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
    const newDecisionSequence = this.decisionSequenceReducer(this.decisionSequence, event);
    await this.publish(event, newDecisionSequence);
    this.decisionSequence = newDecisionSequence;
    return event;
  }
}
