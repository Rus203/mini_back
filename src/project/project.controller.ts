import { Controller, Post } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/run-docker')
  async runDocker() {
    return await this.projectService.runDocker();
  }

  @Post('/stop-docker')
  async stopDocker() {
    return await this.projectService.stopDocker();
  }
}
