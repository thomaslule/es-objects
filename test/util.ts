import { Entity, Event, Reducer } from "../src";

export class Cat extends Entity<FedState> {
  constructor(
    private id: string,
    decisionState: FedState,
    createAndPublish: (eventData: any) => Promise<Event>,
  ) {
    super(decisionState, catFedReducer, createAndPublish);
  }

  public async feed() {
    if (this.getDecision().fed) {
      throw new Error("cat already fed!");
    }
    await this.publishAndApply({ type: "fed" });
  }

  public async pet() {
    await this.publishAndApply({ type: "pet" });
  }

  public isFed() {
    return this.getDecision().fed;
  }
}

export const catFedReducer: Reducer<FedState> = (state = { fed: false }, event) => {
  if (event.type === "fed") {
    return { fed: true };
  }
  return state;
};

export const fedEvent: Event = {
  aggregate: "cat",
  id: "felix",
  sequence: 0,
  type: "fed",
};

export interface FedState { fed: boolean; }
