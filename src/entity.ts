import { makeDecisionReducer } from "./make-decision-reducer";
import { DecisionSequence, Event, Reducer } from "./types";

/**
 * When writing entity classes, you can inherit from this class to write less code.
 *
 * ```typescript
 * class Cat extends Entity<boolean> {
 *   constructor(id, decisionSequence, publish) {
 *     super(id, decisionSequence, publish);
 *   }
 *   public async pet() { await this.publishAndApply({ type: "pet" }); }
 *   protected getAggregate() { return "cat"; }
 *   protected getDecisionReducer() { return catFedReducer; }
 * }
 * ```
 */
export abstract class Entity<TDecision> {

  /**
   * The constructor has the same arguments that the {@link Store} provides to create an entity, which makes interfacing
   * easy.
   *
   * @param id the id of the entity
   * @param decisionSequence the current DecisionSequence (decision projection + sequence of last event)
   * @param publish the publish method to call when the entity wants to emit an event
   * @param publish.event the event to publish
   * @param publish.decisionSequence the DecisionSequence up to date with the event to publish
   */
  constructor(
    private id: string,
    private decisionSequence: DecisionSequence<TDecision>,
    private publish: (event: Event, decisionSequence: DecisionSequence<TDecision>) => Promise<void>,
  ) {
  }

  /**
   * @returns the entity's aggregate
   */
  protected abstract getAggregate(): string;

  /**
   * @return the aggregate's decision reducer
   */
  protected abstract getDecisionReducer(): Reducer<TDecision>;

  /**
   * @returns the entity's id
   */
  protected getId() {
    return this.id;
  }

  /**
   * @return the current decision state
   */
  protected getDecision(): TDecision {
    return this.decisionSequence.decision;
  }

  /**
   * Call this method with only the custom event fields, it will set for you the mandatory fields, emit the event and
   * apply it to itself to update its decision projection.
   *
   * @param eventData the event's custom properties
   * @returns the complete event object
   */
  protected async publishAndApply(eventData: any): Promise<Event> {
    const event: Event = {
      ...eventData,
      aggregate: this.getAggregate(),
      id: this.id,
      sequence: this.decisionSequence.sequence + 1,
    };
    const newDecisionSequence = makeDecisionReducer(this.getDecisionReducer())(this.decisionSequence, event);
    await this.publish(event, newDecisionSequence);
    this.decisionSequence = newDecisionSequence;
    return event;
  }
}
