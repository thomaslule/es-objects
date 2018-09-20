import { Cat, fedEvent } from "./util";

describe("Entity", () => {
  let cat: Cat;
  let publish;

  beforeEach(() => {
    publish = jest.fn().mockReturnValue(Promise.resolve(fedEvent));
    cat = new Cat("felix", { fed: false }, publish);
  });

  test("publishAndApply should publish the Event", async () => {
    await cat.feed();

    expect(publish).toHaveBeenCalledWith({ type: "fed" });
  });

  test("publishAndApply should apply the Event to self", async () => {
    expect(cat.isFed()).toBeFalsy();
    await cat.feed();
    expect(cat.isFed()).toBeTruthy();
  });
});
