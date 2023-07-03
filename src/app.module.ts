import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { ServerModule } from './server/server.module';
import { MailersModule } from './mailers';
import { DatabaseModule } from './database/database.module';
import { DockerModule } from './docker/docker.module';
import { PortModule } from './port/port.module';
import { SocketDeployModule } from './socket-deploy/socket-deploy.module';
import { SocketProgressModule } from './socket-progress/socket-progress.module';
import { FileEncryptorModule } from './file-encryptor/file-encryptor.module';

@Module({
  imports: [
    ProjectModule,
    CronModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ServerModule,
    MailersModule,
    DatabaseModule,
    DockerModule,
    PortModule,
    SocketDeployModule,
    SocketProgressModule,
    FileEncryptorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
