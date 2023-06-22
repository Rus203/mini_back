import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
  Delete
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';

import { ProjectService } from './project.service';
import { storage } from 'src/config';
import { CreateProjectDto } from './dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiInternalServerErrorResponse({ description: 'internal server error' })
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Gets all existing projects'
  })
  @ApiResponse({
    description: 'project list',
    status: 200,
    type: [ProjectResponseDto]
  })
  @Get()
  async index() {
    return await this.projectService.findAll();
  }

  @ApiOperation({
    summary: 'Get one project',
    description: 'Gets one project by its id'
  })
  @ApiResponse({
    status: 200,
    description: 'project info',
    type: ProjectResponseDto
  })
  @ApiInternalServerErrorResponse({ description: 'internal server error' })
  @ApiNotFoundResponse({ description: 'not found a projects' })
  @Get(':project_id')
  async show(@Param('project_id') projectId: string) {
    return await this.projectService.findOneById(projectId);
  }

  @ApiOperation({
    summary: 'Creates a new project',
    description: 'Creates a new project in the database'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sshGitPrivateKey', 'name', 'email', 'gitLink'],
      properties: {
        name: {
          type: 'string',
          description: 'Project name'
        },
        email: {
          type: 'string',
          description: 'Where to send notifications'
        },
        gitLink: {
          type: 'string',
          description:
            'Github link to the repo in SSH format' +
            '(git@github.com:username/repo-name.git)'
        },
        envFile: {
          type: 'string',
          format: 'binary',
          description: 'Config file for a project'
        },
        sshGitPrivateKey: {
          type: 'string',
          format: 'binary',
          description: 'SSH private key for a github account'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    type: ProjectResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Bad request'
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected exception'
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'envFile' }, { name: 'sshGitPrivateKey' }], {
      storage
    })
  )
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles()
    {
      envFile,
      sshGitPrivateKey
    }: {
      envFile?: Express.Multer.File[];
      sshGitPrivateKey?: Express.Multer.File[];
    }
  ) {
    return await this.projectService.create(createProjectDto, {
      envFilePath: envFile ? envFile[0].path : null,
      gitPrivateKeyPath: sshGitPrivateKey[0].path
    });
  }
}
