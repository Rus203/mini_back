import { Module } from '@nestjs/common';
import { CronModule } from 'src/cron/cron.module';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [CronModule],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
