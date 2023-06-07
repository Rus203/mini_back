import * as net from 'net';

export const checkPortAvailability = (port: number): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err: { code: string }) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server
        .once('close', () => {
          resolve(true);
        })
        .close();
    });
    server.listen(port);
  });
};
