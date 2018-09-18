import { DecisionProvider } from "./decision-provider";
import { DecisionSequence } from "./decision-sequence";
import { Entity } from "./entity";
import { Event } from "./event";
import { EventPublisher } from "./event-publisher";

export class Store<T extends Entity> {

  constructor(
    private aggregate: string,
    private EntityClass: new (...args: any[]) => T,
    private decisionProvider: DecisionProvider,
    private eventPublisher: EventPublisher,
  ) {
  }

  public async get(id: string): Promise<T> {
    const decisionProjection = await this.decisionProvider.getDecisionProjection(id);
    return new this.EntityClass(this.aggregate, id, decisionProjection, (e, d) => this.publish(e, d));
  }

  private async publish(event: Event, decision: DecisionSequence) {
    await this.eventPublisher.publish(event);
    if (this.decisionProvider.handleEvent) {
      await this.decisionProvider.handleEvent(event, decision);
    }
  }
}
