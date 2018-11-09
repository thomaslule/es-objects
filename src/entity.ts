import { DecisionProjection, DecisionSequence, Event } from "./types";

export abstract class Entity<TDecision> {
  constructor(
    private aggregate: string,
    private id: string,
    private decisionProjection: DecisionProjection<TDecision>,
    private publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
  ) {
  }

  protected getDecision(): TDecision {
    return this.decisionProjection.getState().decision;
  }

  protected async publishAndApply(eventData: any): Promise<Event> {
    const event: Event = {
      ...eventData,
      aggregate: this.aggregate,
      id: this.id,
      sequence: this.decisionProjection.getState().sequence + 1,
    };
    this.decisionProjection.handleEvent(event);
    await this.publish(event, this.decisionProjection.getState());
    return event;
  }
}
