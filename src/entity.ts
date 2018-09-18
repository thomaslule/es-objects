import { DecisionSequence } from "./decision-sequence";
import { Event } from "./event";
import { Projection } from "./projection";

export abstract class Entity<TDecision> {
  constructor(
    private aggregate: string,
    private id: string,
    private decisionProjection: Projection<DecisionSequence<TDecision>>,
    private publish: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>,
  ) {
  }

  public getId(): string {
    return this.id;
  }

  protected getDecision(): TDecision {
    return this.decisionProjection.getState().decision;
  }

  protected async publishAndApply(eventData: { [x: string]: any }) {
    const sequence = this.decisionProjection.getState().sequence + 1;
    const insertDate = new Date().toISOString();
    const event: Event = { ...eventData, aggregate: this.aggregate, id: this.id, sequence, insertDate };
    this.decisionProjection.handleEvent(event);
    await this.publish(event, this.decisionProjection.getState());
  }
}
