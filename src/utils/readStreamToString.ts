import { Readable } from 'node:stream';

export const readStreamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });
};
