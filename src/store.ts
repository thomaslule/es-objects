import { DecisionProvider, DecisionSequence, Event } from "./types";

/**
 * The object that you need to create your entities from the underlying storage.
 *
 * ```typescript
 * const catStore = new Store<Cat, boolean>(
 *   (id, decisionProjection, publish) => new Cat(id, decisionProjection, publish),
 *   catDecisionProvider,
 *   (event) => bus.publish(event),
 * );
 * const felix = await catStore.get("felix");
 * ```
 */
export class Store<TEntity, TDecision> {
  /**
   * @param createEntity a function that the store will call each time you request an entity. An
   * {@link Entity.constructor|Entity constructor} is perfect here.
   * @param createEntity.id the id of the entity
   * @param createEntity.decisionSequence the current DecisionSequence (decision projection + sequence of last event)
   * @param createEntity.publish the publish method to call when the entity wants to emit an event
   * @param createEntity.publish.event the event to publish
   * @param createEntity.publish.decisionSequence the DecisionSequence up to date with the event to publish
   * @param decisionProvider an object to get the decision state for an entity
   * @param publishEvent the publish method that will be passed to the entities
   */
  constructor(
    private createEntity: (
      id: string,
      decisionSequence: DecisionSequence<TDecision>,
      publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
    ) => TEntity,
    private decisionProvider: DecisionProvider<TDecision>,
    private publishEvent: (event: Event) => Promise<void>,
  ) {
  }

  /**
   * @param id an entity id
   * @returns an entity initialized with its decision projection and ready to emit events
   */
  public async get(id: string): Promise<TEntity> {
    return this.createEntity(
      id,
      await this.decisionProvider.getDecisionSequence(id),
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
