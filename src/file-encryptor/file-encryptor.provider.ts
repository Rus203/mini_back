import crypto from 'node:crypto';
import path from 'node:path';
import {
  rm,
  createReadStream,
  createWriteStream,
  ReadStream,
  WriteStream,
  access,
  rmSync,
  existsSync,
  chmodSync
} from 'fs';

import { readdir } from 'node:fs/promises';

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { pipeline } from 'node:stream';

@Injectable()
export class FileEncryptorProvider implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    const commonFolder = path.join(__dirname, '..', '..', 'mini-back-key');
    const miniBackPrivateKey = path.join(commonFolder, 'id_rsa');

    if (existsSync(miniBackPrivateKey)) {
      await this.encryptFilesOnPlace([miniBackPrivateKey]);
    }
  }

  private encypt(
    readStream: ReadStream,
    writeStream: WriteStream
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(process.env.SECRET_KEY, 'salt', 24, (err, key) => {
        if (err) reject(err);
        const iv = Buffer.alloc(16, 0);

        const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);

        pipeline(readStream, cipher, writeStream, (err) => {
          if (err) reject(err);

          rm(readStream.path, { force: true }, () => {
            resolve();
          });
        });
      });
    });
  }

  private decrypt(
    readStream: ReadStream,
    writeStream: WriteStream
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(process.env.SECRET_KEY, 'salt', 24, (err, key) => {
        if (err) reject(err);

        const iv = Buffer.alloc(16, 0);

        const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);

        pipeline(readStream, decipher, writeStream, (err) => {
          if (err) reject(err);

          rm(readStream.path, { force: true }, () => {
            resolve();
          });
        });
      });
    });
  }

  public encryptFilesOnPlace(pathToFile: string | string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (Array.isArray(pathToFile)) {
        Promise.allSettled(
          pathToFile.map((path) => {
            const readStream = createReadStream(path);
            const writesStream = createWriteStream(path + '.enc');
            return this.encypt(readStream, writesStream);
          })
        )
          .then(() => {
            resolve(true);
          })
          .catch(() => reject(false));
      } else {
        const readStream = createReadStream(pathToFile);
        const writesStream = createWriteStream(pathToFile + '.enc');
        this.encypt(readStream, writesStream)
          .then(() => resolve(true))
          .catch(() => reject(false));
      }
    });
  }

  public decryptFilesOnPlace(path: string | string[]) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(path)) {
        const readStream = createReadStream(path);
        const writesStream = createWriteStream(path.replace(/.enc$/, ''));
        return this.decrypt(readStream, writesStream)
          .then(() => {
            chmodSync(path.replace(/.enc$/, ''), 0o600);
            resolve(true);
          })
          .catch(() => reject(false));
      } else {
        Promise.allSettled(
          path.map((pathItem) => {
            const readStream = createReadStream(pathItem);
            const writesStream = createWriteStream(
              pathItem.replace(/.enc$/, '')
            );
            return this.decrypt(readStream, writesStream).then(() => {
              chmodSync(pathItem.replace(/.enc$/, ''), 0o600);
            });
          })
        )
          .then(() => {
            resolve(true);
          })
          .catch(() => reject(false));
      }
    });
  }

  public async removeUnencryptedFiles(folderPath?: string) {
    const srcPath = path.join(__dirname, '..');
    let filesPath: string;
    if (folderPath !== undefined) {
      filesPath = folderPath;
    } else {
      filesPath = path.join(srcPath, 'uploads', 'files');
    }

    access(filesPath, async (err) => {
      if (err) return;

      const files = await readdir(filesPath);

      for (const file of files) {
        if (path.extname(file) !== '.enc') {
          rmSync(path.join(filesPath, file), { force: true });
        }
      }

      return;
    });
  }
}
