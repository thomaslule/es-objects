import { Stream, Writable } from "stream";

export const consumeStream = async (stream: Stream, handler: (object: any) => void | Promise<void>) => {
  await new Promise((resolve, reject) => {
    const writable = new Writable({
      objectMode: true,
      async write(object, encoding, callback) {
        try {
          await handler(object);
        } catch (err) {
          reject(err);
        }
        callback();
      },
    });
    stream.on("error", reject);
    writable.on("finish", resolve);
    stream.pipe(writable);
  });
};
