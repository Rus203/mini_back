import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { ServerModule } from './server/server.module';
import { MailersModule } from './mailers';
import { DatabaseModule } from './database/database.module';
import { DockerModule } from './docker/docker.module';
import { PortModule } from './port/port.module';

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
    PortModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
