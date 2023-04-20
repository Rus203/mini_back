import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CronService } from '../cron/cron.service';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Project } from './entities';
import { cleanDir, handleServiceErrors } from 'src/utils';
import { CreateProjectDto } from './dto';
import { GitProvider } from 'src/git/git.provider';

interface IProjectFilesInfo {
  envFilePath: string;
  gitPublicKeyPath: string;
  gitPrivateKeyPath: string;
}

@Injectable()
export class ProjectService {
  composeFilePath = './project/docker-compose.yml';
  filePath = path.resolve(this.composeFilePath);

  constructor(
    private readonly cronService: CronService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly gitProvider: GitProvider
  ) {}

  async create(createProjectDto: CreateProjectDto, files: IProjectFilesInfo) {
    try {
      const { envFilePath, gitPrivateKeyPath, gitPublicKeyPath } = files;

      const { name, gitLink } = createProjectDto;
      const srcPath = path.join(__dirname, '..');
      const uploadPath = path.join(srcPath, 'projects', name);

      const newProject = this.projectRepository.create({
        ...createProjectDto,
        uploadPath,
        envFile: envFilePath
      });
      const result = await this.projectRepository.save(newProject);

      await this.gitProvider.clone({
        gitLink,
        uploadPath,
        sshGitPrivateKeyPath: gitPrivateKeyPath,
        sshGitPublicKeyPath: gitPublicKeyPath
      });

      await fsPromise.cp(envFilePath, path.join(uploadPath, '.env'));
      await cleanDir(path.join(srcPath, 'tmp'));

      return result;
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  runDocker() {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose();

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
      const dockerComposeProcess = spawn('sudo docker-compose up -d', {
        cwd: path.dirname(this.filePath),
        stdio: 'inherit',
        shell: true
      });

      let stderr = '';
      dockerComposeProcess.stderr?.on('data', (data) => {
        stderr += data;
      });

      dockerComposeProcess.on('error', (err) => {
        reject(err);
      });

      dockerComposeProcess.on('exit', (code) => {
        if (code !== 0) {
          reject(stderr);
        }

        resolve('ok');
      });

      this.cronService.startTask();
    });
  }

  stopDocker() {
    return new Promise((resolve, reject) => {
      // Checking if the docker-compose.yml file exists
      this.checkDockerCompose();

      const dockerComposeProcess = spawn('sudo docker-compose down --rmi all', {
        cwd: path.dirname(this.filePath),
        stdio: 'inherit',
        shell: true
      });

      let stderr = '';
      dockerComposeProcess.stderr?.on('data', (data) => {
        stderr += data;
      });

      dockerComposeProcess.on('error', (err) => {
        reject(err);
      });

      dockerComposeProcess.on('exit', (code) => {
        if (code !== 0) {
          reject(stderr);
        }

        resolve('ok');
      });

      this.cronService.stopTask();
    });
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
