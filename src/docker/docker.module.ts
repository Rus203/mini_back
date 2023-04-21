import { Module } from '@nestjs/common';
import { CronModule } from 'src/cron';
import { DockerProvider } from './docker.provider';

@Module({
  imports: [CronModule],
  providers: [DockerProvider],
  exports: [DockerProvider]
})
export class DockerModule {}
