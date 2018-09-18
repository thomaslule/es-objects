import { DecisionSequence, makeDecisionReducer, Projection } from "../src";
import { Cat, catFedReducer, fedEvent } from "./util";

describe("Entity", () => {
  let cat: Cat;
  let publish;

  beforeEach(() => {
    const decision = new Projection<DecisionSequence>(makeDecisionReducer(catFedReducer));
    publish = jest.fn().mockReturnValue(Promise.resolve());
    cat = new Cat("cat", "felix", decision, publish);
  });

  test("publishAndApply should publish the Event", async () => {
    await cat.feed();

    expect(publish).toHaveBeenCalled();
    const { insertDate, ...eventWithoutDate } = fedEvent;
    expect(publish.mock.calls[0][0]).toMatchObject(eventWithoutDate);
  });

  test("publishAndApply should apply the Event to self", async () => {
    expect(cat.isFed()).toBeFalsy();
    await cat.feed();
    expect(cat.isFed()).toBeTruthy();
  });
});
