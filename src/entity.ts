import { Event } from "./event";
import { Reducer } from "./reducer";

export abstract class Entity<TDecision> {
  constructor(
    private decisionState: TDecision,
    private decisionReducer: Reducer<TDecision>,
    private publish: (eventData: any) => Promise<Event>,
  ) {
  }

  protected getDecision(): TDecision {
    return this.decisionState;
  }

  protected async publishAndApply(eventData: any): Promise<Event> {
    const event = await this.publish(eventData);
    this.decisionState = this.decisionReducer(this.decisionState, event);
    return event;
  }
}
