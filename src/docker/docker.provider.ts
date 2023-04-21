import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChildProcessCommandProvider } from 'src/utils';

@Injectable()
export class DockerProvider extends ChildProcessCommandProvider {
  runDocker(projectDirectory: string) {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose(projectDirectory);

      // Checking if Docker Compose exists on a local machine
      spawn('sudo docker-compose', ['version'], {
        shell: true,
        stdio: 'inherit'
      }).on('exit', (code) => {
        if (code !== 0) {
          reject('Docker compose is not installed');
        }
      });

      // if images and containers don't exist, create images and their containers
      const dockerComposeProcess = spawn('sudo docker-compose --build up -d', {
        cwd: projectDirectory,
        shell: true
      });

      this.handleProcessErrors(dockerComposeProcess, resolve, reject);
    });
  }

  stopDocker(projectDirectory: string) {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose(projectDirectory);

      const dockerComposeProcess = spawn('sudo docker-compose down --rmi all', {
        cwd: projectDirectory,
        shell: true
      });

      this.handleProcessErrors(dockerComposeProcess, resolve, reject);
    });
  }

  checkDockerCompose(projectDirectory: string) {
    const exists = fs.existsSync(
      path.join(projectDirectory, 'docker-compose.yml')
    );
    if (!exists) {
      throw new InternalServerErrorException(
        'docker-compose.yml file not found'
      );
    }
  }
}
