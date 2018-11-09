import { DecisionProjection, DecisionProvider, DecisionSequence, Event } from "./types";

export class Store<TEntity, TDecision> {
  constructor(
    private createEntity: (
      id: string,
      decisionProjection: DecisionProjection<TDecision>,
      publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
    ) => TEntity,
    private decisionProvider: DecisionProvider<TDecision>,
    private publishEvent: (event: Event) => Promise<void>,
  ) {
  }

  public async get(id: string): Promise<TEntity> {
    return this.createEntity(
      id,
      await this.decisionProvider.getDecisionProjection(id),
      (event, decisionSequence) => this.publish(event, decisionSequence),
    );
  }

  private async publish(event: Event, decisionSequence: DecisionSequence<TDecision>) {
    await this.publishEvent(event);
    if (this.decisionProvider.handleEvent) {
      await this.decisionProvider.handleEvent(event, decisionSequence);
    }
  }
}
