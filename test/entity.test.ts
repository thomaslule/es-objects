import { Cat } from "./util";

describe("Entity", () => {
  let cat: Cat;
  let publish;

  beforeEach(() => {
    publish = jest.fn();
    cat = new Cat("felix", { decision: false, sequence: -1 }, publish);
  });

  test("publishAndApply should publish the Event", async () => {
    await cat.feed();

    expect(publish).toHaveBeenCalledWith(
      { aggregate: "cat", id: "felix", sequence: 0, type: "fed" },
      { decision: true, sequence: 0 }
    );
  });

  test("publishAndApply should apply the Event to self", async () => {
    await cat.feed();
    await expect(cat.feed()).rejects.toThrow("cat already fed!");
  });
});
