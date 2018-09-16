import { Entity, makeDecisionReducer, Projection } from "../src";
import { DecisionState } from "../src/decision-state";

class Cat extends Entity {
  public async feed() {
    await this.publishAndApply({ type: "feed" });
  }

  public isFed() {
    return this.getDecision().fed;
  }
}

const catReducer = (state = { fed: false }, event) => {
  if (event.type === "feed") {
    return { fed: true };
  }
  return state;
};

describe("Entity", () => {
  let cat: Cat;
  let publish;

  beforeEach(() => {
    const decision = new Projection<DecisionState>(makeDecisionReducer(catReducer));
    publish = jest.fn().mockReturnValue(Promise.resolve());
    cat = new Cat("cat", "felix", decision, publish);
  });

  test("publishAndApply should publish the Event", async () => {
    await cat.feed();

    expect(publish).toHaveBeenCalled();
    expect(publish.mock.calls[0][0]).toMatchObject({
      aggregate: "cat",
      id: "felix",
      sequence: 0,
    });
  });

  test("publishAndApply should apply the Event to self", async () => {
    expect(cat.isFed()).toBeFalsy();
    await cat.feed();
    expect(cat.isFed()).toBeTruthy();
  });
});
