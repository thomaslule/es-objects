import { DecisionProjection } from "./decision-projection";
import { DecisionState } from "./decision-state";
import { Entity } from "./entity";
import { Event } from "./event";
import { EventPublisher } from "./event-publisher";

export class Store<T extends Entity> {

  constructor(
    private aggregate: string,
    private EntityClass: new (...args: any[]) => T,
    private storedDecisionProjection: DecisionProjection,
    private eventPublisher: EventPublisher,
  ) {
  }

  public async get(id: string): Promise<T> {
    const decisionProjection = await this.storedDecisionProjection.getProjection(id);
    return new this.EntityClass(this.aggregate, id, decisionProjection, (e, d) => this.publish(e, d));
  }

  private async publish(event: Event, decision: DecisionState) {
    await this.eventPublisher.publish(event);
    await this.storedDecisionProjection.storeState(event.id, decision);
  }
}
