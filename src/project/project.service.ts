import fsPromise from 'fs/promises';
import path from 'path';

import { HttpException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Project } from './entities';
import { cleanDir, handleServiceErrors } from 'src/utils';
import { CreateProjectDto } from './dto';
import { GitProvider } from 'src/git';
import { DockerProvider } from 'src/docker';
import { CronService } from 'src/cron';

interface IProjectFilesInfo {
  envFilePath: string;
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

  async create(createProjectDto: CreateProjectDto, files: IProjectFilesInfo) {
    try {
      const { envFilePath, gitPrivateKeyPath } = files;

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
        sshGitPrivateKeyPath: gitPrivateKeyPath
      });

      await fsPromise.cp(envFilePath, path.join(uploadPath, '.env'));
      await cleanDir(path.join(srcPath, 'tmp'));

      await this.run(result);

      return result;
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  async run(project: string | Project): Promise<void> {
    try {
      let persistedProject: Project;

      if (typeof project === 'string') {
        persistedProject = await this.projectRepository.findOneBy({
          name: project
        });
      } else {
        persistedProject = project;
      }

      if (persistedProject) {
        const result = await this.dockerProvider.runDocker(
          persistedProject.uploadPath
        );

        if (result)
          this.cronService.addCheckProjectHealthTask(persistedProject);
      }

      throw new HttpException({ message: 'Project not found' }, 404);
    } catch (err) {
      handleServiceErrors(err);
    }
  }

  async stop(projectName: string) {
    try {
      const project = await this.projectRepository.findOneBy({
        name: projectName
      });
      if (project) {
        const result = await this.dockerProvider.stopDocker(project.uploadPath);

        if (result) this.cronService.stopCheckProjectHealthTask(project);
      }

      throw new HttpException({ message: 'Project not found' }, 404);
    } catch (err) {
      handleServiceErrors(err);
    }
  }
}
