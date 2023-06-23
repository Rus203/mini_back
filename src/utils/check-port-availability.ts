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

    server.listen(port, '0.0.0.0', () => {
      server.unref();
    });

    const tester = net.createConnection(port, '0.0.0.0', () => {
      tester.end();
      server.close();
    });
    tester.on('error', (err: { code: string }) => {
      if (err.code === 'ECONNREFUSED') {
        resolve(true);
      } else {
        reject(err);
      }
    });
  });
};
