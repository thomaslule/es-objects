import { DecisionState } from "./decision-state";
import { Event } from "./event";
import { Projection } from "./projection";

export abstract class Entity {
  constructor(
    private aggregate: string,
    private id: string,
    private decisionProjection: Projection<DecisionState>,
    private publish: (event: Event, decision: DecisionState) => Promise<void>,
  ) {
  }

  public getId() {
    return this.id;
  }

  protected getDecision() {
    return this.decisionProjection.getState().decision;
  }

  protected async publishAndApply(eventData) {
    const sequence = this.decisionProjection.getState().sequence + 1;
    const insertDate = new Date().toISOString();
    const event: Event = { ...eventData, aggregate: this.aggregate, id: this.id, sequence, insertDate };
    this.decisionProjection.handleEvent(event);
    await this.publish(event, this.decisionProjection.getState());
  }
}
