import { DecisionProvider } from "./decision-provider";
import { Event } from "./event";
import { EventPublisher } from "./event-publisher";
import { Projection } from "./projection";

export class Store<TEntity, TDecision> {
  constructor(
    private aggregate: string,
    private createEntity: (
      id: string,
      decisionState: TDecision,
      publish: (eventData: any) => Promise<Event>,
    ) => TEntity,
    private decisionProvider: DecisionProvider<TDecision>,
    private eventPublisher: EventPublisher,
  ) {
  }

  public async get(id: string): Promise<TEntity> {
    const decisionProjection = await this.decisionProvider.getDecisionProjection(id);
    return this.createEntity(
      id,
      decisionProjection.getState().decision,
      (eventData: any) => this.publish(id, eventData, decisionProjection),
    );
  }

  private async publish(id: string, eventData: any, decisionProjection: Projection<any>): Promise<Event> {
    const event: Event = {
      ...eventData,
      aggregate: this.aggregate,
      id,
      sequence: decisionProjection.getState().sequence + 1,
      insertDate: new Date().toISOString(),
    };
    decisionProjection.handleEvent(event);
    await this.eventPublisher.publish(event);
    if (this.decisionProvider.handleEvent) {
      await this.decisionProvider.handleEvent(event, decisionProjection.getState());
    }
    return event;
  }
}
