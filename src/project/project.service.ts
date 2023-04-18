import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { CronService } from '../cron/cron.service';

@Injectable()
export class ProjectService {
  composeFilePath = './project/docker-compose.yml';
  filePath = path.resolve(this.composeFilePath);
  constructor(private readonly cronService: CronService) {}

  runDocker() {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose()
  
      // Checking if Docker Compose exists on a local machine
        spawn('sudo docker-compose', ['version'], {shell: true, stdio: "inherit"})
          .on('exit', (code) => {
            if (code !== 0) {
              reject('Docker compose is not installed');
          }})
  
      // if images and containers don't exist, create images and their containers
        const dockerComposeProcess = spawn(
          'sudo docker-compose up -d',
          { cwd: path.dirname(this.filePath), stdio: 'inherit', shell: true }
        );
  
        let stderr = '';
        dockerComposeProcess.stderr?.on('data', (data) => {
          stderr += data;
        });

        dockerComposeProcess.on("error", (err) => {
          reject(err)
        })
  
        dockerComposeProcess.on('exit', (code) => {
          if (code !== 0) {
            reject(stderr);
          }

          resolve('ok')
      });
  
      this.cronService.startTask();
    })

  }

  stopDocker() {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose()

        const dockerComposeProcess = spawn(
          'sudo docker-compose down --rmi all',
          { cwd: path.dirname(this.filePath), stdio: 'inherit', shell: true }
        );
  
        let stderr = '';
        dockerComposeProcess.stderr?.on('data', (data) => {
          stderr += data;
        });

        dockerComposeProcess.on("error", (err) => {
          reject(err)
        })
  
        dockerComposeProcess.on('exit', (code) => {
          if (code !== 0) {
            reject(stderr);
          }

          resolve('ok')
      });
  
      this.cronService.stopTask();
    })
  }

  checkDockerCompose() {
    const exists = fs.existsSync(this.filePath);
    if (!exists) {
      throw new InternalServerErrorException(
        'docker-compose.yml file not found'
      );
    }
  }
}
