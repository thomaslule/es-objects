import { Stream } from "stream";
import { projectFromEvents } from "../../src";
import { catFedReducer, fedEvent } from "../util";

const arrayToStream = (arr: any[]): Stream => {
  const stream = new Stream.Readable({ objectMode: true });
  arr.forEach((e) => { stream.push(e); });
  stream.push(null);
  return stream;
};

describe("ProjectFromEvents", () => {
  test("it should project a state from an event stream and a reducer", async () => {
    expect(await projectFromEvents(catFedReducer, arrayToStream([fedEvent]))).toEqual({fed: true});
  });

  test("it should return the reducer's default state when there is no event", async () => {
    expect(await projectFromEvents(catFedReducer, arrayToStream([]))).toEqual({fed: false});
  });
});
