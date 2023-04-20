import fs, { access } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { Injectable } from '@nestjs/common';
import { ChildProcessCommandProvider, cleanDir } from '../utils';

export interface IGitCloneParams {
  gitLink: string;
  uploadPath: string;
  sshGitPrivateKeyPath: string;
  sshGitPublicKeyPath: string;
}

@Injectable()
export class GitProvider extends ChildProcessCommandProvider {
  private placeSSHGitKeys(
    publicKeyPath: string,
    privateKeyPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const sshFolder = path.join(os.homedir(), '.ssh');

      access(sshFolder, (err) => {
        if (err) {
          fs.mkdirSync(sshFolder, { recursive: true });
        }

        const keyFullPath = path.resolve(publicKeyPath);
        fs.cp(keyFullPath, path.join(sshFolder, 'id_rsa.pub'), (err) => {
          if (err) reject(err);

          fs.cp(privateKeyPath, path.join(sshFolder, 'id_rsa'), (err) => {
            if (err) {
              reject(err);
            }

            resolve();
          });
        });
      });
    });
  }

  private removeSSHGitKeys(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sshFolder = path.join(os.homedir(), '.ssh');

      access(sshFolder, (err) => {
        if (err) resolve();

        fs.rm(path.join(sshFolder, 'id_rsa.pub'), () => {
          fs.rm(path.join(sshFolder, 'id_rsa'), () => {
            resolve();
          });
        });
      });
    });
  }

  public clone({
    gitLink,
    uploadPath,
    sshGitPrivateKeyPath,
    sshGitPublicKeyPath
  }: IGitCloneParams) {
    return new Promise((resolve, reject) => {
      access(uploadPath, (err) => {
        if (err) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        this.placeSSHGitKeys(sshGitPublicKeyPath, sshGitPrivateKeyPath)
          .then(() => {
            const urlPath = url
              .pathToFileURL(sshGitPrivateKeyPath)
              .pathname.replace(/^\//, '');
            const urlPublicPath = url
              .pathToFileURL(sshGitPublicKeyPath)
              .pathname.replace(/^\//, '');
            cleanDir(uploadPath).then(() => {
              const OS = os.platform();
              const windowsCommand = `cd ${uploadPath} && chmod 600 ${urlPath} ${urlPublicPath} && git clone ${gitLink} ./ --config core.sshCommand="ssh -i ${urlPath}"`;
              const linuxCommand = `cd ${uploadPath} && chmod 600 /${urlPath} /${urlPublicPath} && git clone ${gitLink} ./ --config core.sshCommand="ssh -i /${urlPath}"`;
              const command = OS === 'win32' ? windowsCommand : linuxCommand;

              const childProcess = spawn(command, { shell: true });

              this.handleProcessErrors(childProcess, resolve, reject);
            });
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            this.removeSSHGitKeys();
          });
      });
    });
  }
}
