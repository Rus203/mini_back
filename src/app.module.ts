import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { ServerModule } from './server/server.module';
import { MailersModule } from './mailers';

@Module({
  imports: [
    ProjectModule,
    CronModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ServerModule,
    MailersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
