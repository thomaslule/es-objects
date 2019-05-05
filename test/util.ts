import { DecisionSequence, Entity, Event, Reducer } from "../src";

export class Cat extends Entity<boolean> {
  constructor(
    id: string,
    decisionSequence: DecisionSequence<boolean>,
    publish: (
      event: Event,
      decisionSequence: DecisionSequence<boolean>
    ) => Promise<void>
  ) {
    super(id, decisionSequence, publish);
  }

  public async feed() {
    if (this.getDecision()) {
      throw new Error("cat already fed!");
    }
    await this.publishAndApply({ type: "fed" });
  }

  public async pet() {
    await this.publishAndApply({ type: "pet" });
  }

  protected getAggregate() {
    return "cat";
  }

  protected getDecisionReducer() {
    return catFedReducer;
  }
}

export const catFedReducer: Reducer<boolean> = (state = false, event) => {
  if (event.type === "fed") {
    return true;
  }
  return state;
};

export const fedEvent: Event = {
  aggregate: "cat",
  id: "felix",
  sequence: 0,
  type: "fed"
};
