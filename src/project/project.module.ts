import { Module } from '@nestjs/common';
import { CronModule } from 'src/cron/cron.module';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './entities';

import { GitModule } from 'src/git';
import { DockerModule } from 'src/docker';
import { PortModule } from 'src/port/port.module';
import { FileEncryptorModule } from '../file-encryptor/file-encryptor.module';
import { SocketProgressModule } from '../socket-progress/socket-progress.module';

@Module({
  imports: [
    CronModule,
    TypeOrmModule.forFeature([Project]),
    GitModule,
    DockerModule,
    PortModule,
    FileEncryptorModule,
    SocketProgressModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {}
