import { ChildProcess } from 'child_process';
import { readStreamToString } from './readStreamToString';

interface HandleProcessErrorsOption {
  ignoreErrors: boolean;
}

export class ChildProcessCommandProvider {
  protected handleProcessErrors = (
    childProcess: ChildProcess,
    resolve: (value: boolean | PromiseLike<boolean>) => void,
    reject: (reason: any) => void,
    options: HandleProcessErrorsOption = { ignoreErrors: false },
  ) => {
    let errorFromStderr: string;

    childProcess.on('error', (err) => {
      reject(err);
    });

    readStreamToString(childProcess.stderr)
      .then((data) => {
        console.log(data);
        errorFromStderr = data;
      })
      .catch((err) => {
        if (typeof err === 'string') {
          errorFromStderr = err;
        }

        if ('message' in err) {
          errorFromStderr = err.message;
        }
      });

    childProcess.on('exit', (code) => {
      if (options.ignoreErrors) resolve(true);

      if (code !== 0) {
        reject(errorFromStderr);
      }
      resolve(true);
    });
  };
}
