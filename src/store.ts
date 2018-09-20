import { DecisionProvider } from "./decision-provider";
import { DecisionSequence } from "./decision-sequence";
import { Entity } from "./entity";
import { Event } from "./event";
import { EventPublisher } from "./event-publisher";
import { Projection } from "./projection";

export class Store<T extends Entity<TDecision>, TDecision> {
  constructor(
    private createEntity: (
      id: string,
      decisionProjection: Projection<DecisionSequence<TDecision>>,
      publish: (event: Event, decision: DecisionSequence<TDecision>) => Promise<void>,
    ) => T,
    private decisionProvider: DecisionProvider<TDecision>,
    private eventPublisher: EventPublisher,
  ) {
  }

  public async get(id: string): Promise<T> {
    const decisionProjection = await this.decisionProvider.getDecisionProjection(id);
    return this.createEntity(
      id,
      decisionProjection,
      (e: Event, d: DecisionSequence<TDecision>) => this.publish(e, d),
    );
  }

  private async publish(event: Event, decision: DecisionSequence<TDecision>) {
    await this.eventPublisher.publish(event);
    if (this.decisionProvider.handleEvent) {
      await this.decisionProvider.handleEvent(event, decision);
    }
  }
}
