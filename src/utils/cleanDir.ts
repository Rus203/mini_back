import { readdir, rmSync } from 'fs';
import { join } from 'path';

export const cleanDir = (dirPath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      }

      files.forEach((file) => {
        rmSync(join(dirPath, file), { recursive: true, force: true });
      });

      resolve(true);
    });
  });
};
