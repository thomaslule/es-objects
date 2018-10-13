import { Readable, Writable } from "stream";

export const consumeStream = async (readable: Readable, handler: (object: any) => void | Promise<void>) => {
  const writable = new Writable({
    objectMode: true,
    async write(data, encoding, callback) {
      try {
        await handler(data);
        callback();
      } catch (err) {
        this.destroy(err);
      }
    },
  });
  const promise = new Promise((resolve, reject) => {
    readable.on("error", reject);
    writable.on("error", reject);
    writable.on("finish", resolve);
  });
  readable.pipe(writable);
  await promise;
};
