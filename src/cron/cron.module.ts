import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MailersModule } from 'src/mailers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/project/entities';

@Module({
  imports: [MailersModule, TypeOrmModule.forFeature([Project])],
  providers: [CronService],
  exports: [CronService]
})
export class CronModule {}
