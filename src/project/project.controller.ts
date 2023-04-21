import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { storage } from 'src/config';
import { CreateProjectDto } from './dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'envFile' },
        { name: 'sshGitPrivateKey' },
        { name: 'sshGitPublicKey' }
      ],
      {
        storage
      }
    )
  )
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles()
    {
      envFile,
      sshGitPrivateKey,
      sshGitPublicKey
    }: {
      envFile?: Express.Multer.File[];
      sshGitPrivateKey?: Express.Multer.File[];
      sshGitPublicKey?: Express.Multer.File[];
    }
  ) {
    return await this.projectService.create(createProjectDto, {
      envFilePath: envFile[0].path,
      gitPrivateKeyPath: sshGitPrivateKey[0].path,
      gitPublicKeyPath: sshGitPublicKey[0].path
    });
  }

  @Post(':name/run')
  async runDocker(@Param('name') name: string) {
    return await this.projectService.run(name);
  }

  @Post(':name/stop')
  async stopDocker(@Param('name') name: string) {
    return await this.projectService.stop(name);
  }
}
