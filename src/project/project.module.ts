import { Module } from '@nestjs/common';
import { CronModule } from 'src/cron/cron.module';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities';
import { GitModule } from 'src/git/git.module';

@Module({
  imports: [CronModule, TypeOrmModule.forFeature([Project]), GitModule],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
