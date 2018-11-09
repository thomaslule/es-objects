import { DecisionSequence, Entity, Event, Reducer } from "../src";

export class Cat extends Entity<FedState> {
  constructor(
    id: string,
    decisionSequence: DecisionSequence<FedState>,
    publish: (event: Event, decisionSequence: DecisionSequence<FedState>) => Promise<void>,
  ) {
    super(id, decisionSequence, publish);
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

  protected getAggregate() {
    return "cat";
  }

  protected getReducer() {
    return catFedReducer;
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
