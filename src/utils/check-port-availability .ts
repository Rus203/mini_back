import * as net from 'net';

export const checkPortAvailability = (ports: number[]): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const promises = ports.map((port) => {
      return new Promise<{ port: number; isAvailable: boolean }>(
        (resolve, reject) => {
          const tester = net
            .createServer()
            .once('error', (err: { code: string }) => {
              if (err.code === 'EADDRINUSE') {
                resolve({ port, isAvailable: false });
              } else {
                reject(err);
              }
            })
            .once('listening', () => {
              tester
                .once('close', () => {
                  resolve({ port, isAvailable: true });
                })
                .close();
            })
            .listen(port);
        }
      );
    });

    Promise.all(promises)
      .then((results) => {
        const unavailablePorts = results.filter(
          (result) => !result.isAvailable
        );
        if (unavailablePorts.length > 0) {
          reject(
            new Error(
              `Ports are not available: ${unavailablePorts
                .map((port) => port.port)
                .join(', ')}`
            )
          );
        } else {
          resolve();
        }
      })
      .catch(reject);
  });
};
