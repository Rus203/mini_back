import fs, { access } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { Injectable } from '@nestjs/common';
import { ChildProcessCommandProvider } from '../utils';

export interface IGitCloneParams {
  gitLink: string;
  uploadPath: string;
  sshGitPrivateKeyPath: string;
}

@Injectable()
export class GitProvider extends ChildProcessCommandProvider {
  public clone({ gitLink, uploadPath, sshGitPrivateKeyPath }: IGitCloneParams) {
    return new Promise((resolve, reject) => {
      access(uploadPath, (err) => {
        if (err) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const childProcess = spawn(
          'eval $(ssh-agent -s)',
          [
            `&& cd ${uploadPath}`,
            `&& chmod 600 ${sshGitPrivateKeyPath}`,
            `&& ssh-add ${sshGitPrivateKeyPath}`,
            `&& git clone ${gitLink} ./`
          ],
          {
            shell: true
          }
        );

        this.handleProcessErrors(childProcess, resolve, reject);
      });
    });
  }
}
