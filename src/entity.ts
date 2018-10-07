import { Event, Reducer } from "./types";

export abstract class Entity<TDecision> {
  constructor(
    private decisionState: TDecision,
    private decisionReducer: Reducer<TDecision>,
    private createAndPublish: (eventData: any) => Promise<Event>,
  ) {
  }

  protected getDecision(): TDecision {
    return this.decisionState;
  }

  protected async publishAndApply(eventData: any): Promise<Event> {
    const event = await this.createAndPublish(eventData);
    this.decisionState = this.decisionReducer(this.decisionState, event);
    return event;
  }
}
