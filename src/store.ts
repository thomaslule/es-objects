import { InMemoryReduceProjection } from "./projection/in-memory-reduce-projection";
import { DecisionProvider, Event } from "./types";

export class Store<TEntity, TDecision> {
  constructor(
    private aggregate: string,
    private createEntity: (
      id: string,
      decisionState: TDecision,
      createAndPublish: (eventData: any) => Promise<Event>,
    ) => TEntity,
    private decisionProvider: DecisionProvider<TDecision>,
    private publish: (event: Event) => Promise<void>,
  ) {
  }

  public async get(id: string): Promise<TEntity> {
    const decisionProjection = await this.decisionProvider.getDecisionProjection(id);
    return this.createEntity(
      id,
      decisionProjection.getState().decision,
      (eventData: any) => this.createAndPublish(id, eventData, decisionProjection),
    );
  }

  private async createAndPublish(
    id: string,
    eventData: any,
    decisionProjection: InMemoryReduceProjection<any>,
  ): Promise<Event> {
    const event: Event = {
      ...eventData,
      aggregate: this.aggregate,
      id,
      sequence: decisionProjection.getState().sequence + 1,
    };
    decisionProjection.handleEvent(event);
    await this.publish(event);
    if (this.decisionProvider.handleEvent) {
      await this.decisionProvider.handleEvent(event, decisionProjection.getState());
    }
    return event;
  }
}
