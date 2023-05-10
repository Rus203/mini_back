import fsPromise from 'fs/promises';
import path from 'path';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Project, ProjectState } from './entities';
import { cleanDir, handleServiceErrors } from 'src/utils';
import { CreateProjectDto } from './dto';
import { GitProvider } from 'src/git';
import { DockerProvider } from 'src/docker';
import { CronService } from 'src/cron';


interface IProjectFilesInfo {
  envFilePath: string | null;
  gitPrivateKeyPath: string;
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly gitProvider: GitProvider,
    private readonly dockerProvider: DockerProvider,
    private readonly cronService: CronService
  ) {}

  async findAll() {
    return await this.projectRepository.find();
  }

  async findOneById(id: string): Promise<Project> {
    try {
      return await this.projectRepository.findOneByOrFail({ id });
    } catch (err) {
      throw new NotFoundException();
    }
  }

  async create(createProjectDto: CreateProjectDto, files: IProjectFilesInfo) {
    try {
      const { envFilePath, gitPrivateKeyPath } = files;

      const { name } = createProjectDto;
      const srcPath = path.join(__dirname, '..');
      const uploadPath = path.join(srcPath, 'projects', name);

      const newProject = this.projectRepository.create({
        ...createProjectDto,
        uploadPath,
        envFile: envFilePath,
        gitPrivateKeyPath
      });
      const result = await this.projectRepository.save(newProject);

      // await this.gitProvider.clone({
      //   gitLink,
      //   uploadPath,
      //   sshGitPrivateKeyPath: gitPrivateKeyPath
      // });

      // if (envFilePath) {
      //   await fsPromise.cp(envFilePath, path.join(uploadPath, '.env'));
      // }

      // await cleanDir(path.join(srcPath, 'tmp'));

      // await this.run(result);

      return result;
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  async run(id: string): Promise<boolean> {
    try {
      const persistedProject = await this.projectRepository.findOneBy({ id });

      if (persistedProject) {
        let result: boolean;

        const { gitLink, uploadPath, gitPrivateKeyPath, envFile } =
          persistedProject;
        await this.gitProvider.clone({
          gitLink,
          uploadPath,
          sshGitPrivateKeyPath: gitPrivateKeyPath
        });

        if (envFile) {
          await fsPromise.cp(envFile, path.join(uploadPath, '.env'));
          await fsPromise.unlink(envFile);
        }

        await fsPromise.unlink(gitPrivateKeyPath);

        try {
          await this.dockerProvider.runDocker(persistedProject.uploadPath);
          result = true;
        } catch (err) {
          handleServiceErrors(err);
        }

        if (result) {
          this.cronService.addCheckProjectHealthTask(persistedProject);
          persistedProject.state = ProjectState.Running;
          await this.projectRepository.save(persistedProject);
        }

        return true;
      }

      throw new HttpException({ message: 'Project not found' }, 404);
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  async delete(projectId: string): Promise<boolean> {
    try {
      const project = await this.projectRepository.findOneBy({
        id: projectId
      });
      if (project) {
        const result = await this.dockerProvider.stopDocker(project.uploadPath);

        if (result) {
          this.cronService.stopCheckProjectHealthTask(project);
          await this.projectRepository.delete({ id: projectId });
        }

        return true;
      }

      throw new HttpException({ message: 'Project not found' }, 404);
    } catch (err) {
      handleServiceErrors(err);
    }
  }
}
