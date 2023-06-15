import fsPromise from 'fs/promises';
import { existsSync, unlink } from 'fs';
import { join } from 'path';
import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { DeleteStatus, DeployStatus } from '../enums';
import { SocketProgressGateway } from 'src/socket-progress/socket-progress.gateway';
import { makeCopyFile } from '../utils/make-copy-file';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Project, ProjectState } from './entities';
import {
  analyzeDockerfile,
  checkPortAvailability,
  handleServiceErrors,
  analyzeDockerComposeFile
} from '../utils';
import { CreateProjectDto } from './dto';
import { GitProvider } from '../git';
import { DockerProvider } from '../docker';
import { CronService } from '../cron';
import { PortService } from '../port/port.service';
import { FileEncryptorProvider } from '../file-encryptor/file-encryptor.provider';
import { normalizeProjectName } from '../utils/normalize-project-name';
import { SocketDeployGateway } from 'src/socket-deploy/socket-deploy.gateway';

interface IProjectFilesInfo {
  envFilePath: string | null;
  gitPrivateKeyPath: string;
}

@Injectable()
export class ProjectService {
  rootDirectory = join(__dirname, '..', '..');
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly gitProvider: GitProvider,
    private readonly dockerProvider: DockerProvider,
    // private readonly cronService: CronService,
    private readonly portService: PortService,
    private readonly fileEncryptorProvider: FileEncryptorProvider,
    private readonly socketProgressGateway: SocketProgressGateway
  ) {}

  async findAll() {
    const projects = await this.projectRepository.find();
    return projects.map((project) => {
      const { envFile, uploadPath, gitPrivateKeyPath, ...rest } = project;
      return rest;
    });
  }

  async findOneById(id: string) {
    try {
      const { uploadPath, gitPrivateKeyPath, envFile, ...rest } =
        await this.projectRepository.findOneByOrFail({ id });

      return rest;
    } catch (err) {
      throw new NotFoundException();
    }
  }

  async create(createProjectDto: CreateProjectDto, files: IProjectFilesInfo) {
    try {
      let { gitPrivateKeyPath, envFilePath } = files;

      const name = normalizeProjectName(createProjectDto.name);

      const uploadPath = join(this.rootDirectory, 'projects', name);

      const haveToEncrypt = [gitPrivateKeyPath];
      if (existsSync(envFilePath)) {
        haveToEncrypt.push(envFilePath);
      }

      await this.fileEncryptorProvider.encryptFilesOnPlace(haveToEncrypt);

      gitPrivateKeyPath += '.enc';

      if (existsSync(envFilePath)) {
        envFilePath += '.enc';
      }

      const newProject = this.projectRepository.create({
        ...createProjectDto,
        uploadPath,
        envFile: envFilePath,
        gitPrivateKeyPath
      });

      const {
        uploadPath: _uploadPath,
        gitPrivateKeyPath: _gitPrivateKeyPath,
        envFile,
        ...rest
      } = await this.projectRepository.save(newProject);
      return rest;
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  async run(id: string) {
    const persistedProject = await this.projectRepository.findOneBy({ id });

    if (!persistedProject) {
      throw new Error('Project not found');
    }

    if (persistedProject.state !== ProjectState.UNDEPLOYED) {
      throw new Error('Project has already deployed or failed');
    }

    this.socketProgressGateway.emitDeployStatus(
      DeployStatus.START,
      persistedProject.id
    );

    const { gitLink, uploadPath, gitPrivateKeyPath, envFile } =
      persistedProject;

    let tempGitPrivateKey = await makeCopyFile(gitPrivateKeyPath);
    let tempEnvFile: string;
    const haveToEncrypt = [tempGitPrivateKey];

    if (envFile) {
      tempEnvFile = await makeCopyFile(envFile);
      haveToEncrypt.push(tempEnvFile);
    }

    await this.fileEncryptorProvider.decryptFilesOnPlace(haveToEncrypt);

    tempGitPrivateKey = tempGitPrivateKey.replace(/.enc$/, '');

    if (tempEnvFile) {
      tempEnvFile = tempEnvFile.replace(/.enc$/, '');
    }

    this.socketProgressGateway.emitDeployStatus(
      DeployStatus.PREPARING,
      persistedProject.id
    );

    try {
      let result: boolean;

      await this.gitProvider.clone({
        gitLink,
        uploadPath,
        sshGitPrivateKeyPath: tempGitPrivateKey
      });

      const ports = [
        ...analyzeDockerComposeFile(uploadPath),
        ...analyzeDockerfile(uploadPath)
      ];

      console.log('ports: ', ports);

      const promises = ports.map(async (port) => {
        const res = await checkPortAvailability(port);
        const ports = await this.portService.getPorts({ port });
        if (!res || ports.length > 0) {
          throw new Error('This port is not available');
        }

        return port;
      });

      const resolvedPorts = await Promise.all(promises);

      for (let i = 0; i < resolvedPorts.length; i++) {
        await this.portService.addPort({
          port: resolvedPorts[0],
          projectId: persistedProject.id
        });
      }

      if (tempEnvFile) {
        await fsPromise.cp(tempEnvFile, join(uploadPath, '.env'));
      }

      this.socketProgressGateway.emitDeployStatus(
        DeployStatus.CHECKING,
        persistedProject.id
      );

      try {
        await this.dockerProvider.runDocker(persistedProject.uploadPath);
        result = true;
      } catch (err) {
        handleServiceErrors(err);
      }

      this.socketProgressGateway.emitDeployStatus(
        DeployStatus.RUN_DOCKER,
        persistedProject.id
      );

      if (result) {
        // this.cronService.addCheckProjectHealthTask(persistedProject);
        persistedProject.state = ProjectState.DEPLOYED;
        await this.projectRepository.save(persistedProject);

        this.socketProgressGateway.emitDeployStatus(
          DeployStatus.ADD_CRON_TASK,
          persistedProject.id
        );
      }
    } catch (err) {
      persistedProject.state = ProjectState.FAILED;
      await this.projectRepository.save(persistedProject);

      handleServiceErrors(err);
    } finally {
      if (existsSync(tempEnvFile)) {
        fsPromise.unlink(tempEnvFile);
      }

      if (existsSync(tempGitPrivateKey)) {
        fsPromise.unlink(tempGitPrivateKey);
      }

      this.socketProgressGateway.emitDeployStatus(
        DeployStatus.FINISH,
        persistedProject.id
      );
    }
  }

  async delete(projectId: string) {
    const project = await this.projectRepository.findOneBy({
      id: projectId
    });

    if (!project) {
      throw new Error('Project not found');
    }

    try {
      this.socketProgressGateway.emitDeleteStatus(
        DeleteStatus.START,
        project.id
      );

      if (project.state === ProjectState.DEPLOYED) {
        await this.dockerProvider.stopDocker(project.uploadPath);

        this.socketProgressGateway.emitDeleteStatus(
          DeleteStatus.STOP_DOCKER,
          project.id
        );

        // this.cronService.stopCheckProjectHealthTask(project);

        this.socketProgressGateway.emitDeleteStatus(
          DeleteStatus.STOP_CRON_TASK,
          project.id
        );
      }

      await this.projectRepository.delete({ id: projectId });

      this.socketProgressGateway.emitDeleteStatus(
        DeleteStatus.REMOVE_TRASH,
        project.id
      );
    } catch (err) {
      handleServiceErrors(err);
    } finally {
      if (existsSync(project.envFile)) {
        fsPromise.unlink(project.envFile);
      }

      if (existsSync(project.gitPrivateKeyPath)) {
        fsPromise.unlink(project.gitPrivateKeyPath);
      }

      this.socketProgressGateway.emitDeleteStatus(
        DeleteStatus.FINISH,
        project.id
      );
    }
  }
}
