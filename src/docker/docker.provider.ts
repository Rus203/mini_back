import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChildProcessCommandProvider } from 'src/utils';

@Injectable()
export class DockerProvider extends ChildProcessCommandProvider {
  public runDocker(projectDirectory: string) {
    return new Promise((resolve, reject) => {
      this.checkDockerComposeFile(projectDirectory);

      this.checkDockerComposeInstallation()
        .then(() => {
          const dockerComposeProcess = spawn(
            'sudo docker-compose up --build -d',
            {
              cwd: projectDirectory,
              shell: true
            }
          );

          this.handleProcessErrors(dockerComposeProcess, resolve, reject);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public stopDocker(projectDirectory: string) {
    return new Promise((resolve, reject) => {
      this.checkDockerComposeFile(projectDirectory);

      const dockerComposeProcess = spawn('sudo docker-compose down --rmi all', {
        cwd: projectDirectory,
        shell: true
      });

      this.handleProcessErrors(dockerComposeProcess, resolve, reject);
    });
  }

  private checkDockerComposeFile(projectDirectory: string): void {
    const exists = fs.existsSync(
      path.join(projectDirectory, 'docker-compose.yml')
    );
    if (!exists) {
      throw new InternalServerErrorException(
        'docker-compose.yml file not found'
      );
    }
  }

  private checkDockerComposeInstallation(): Promise<void> {
    return new Promise((resolve, reject) => {
      spawn('sudo docker-compose', ['version'], {
        shell: true
      }).on('exit', (code) => {
        if (code !== 0) {
          reject('Docker compose is not installed');
        } else {
          resolve();
        }
      });
    });
  }
}
