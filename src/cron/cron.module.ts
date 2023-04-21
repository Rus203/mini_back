import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MailersModule } from 'src/mailers';

@Module({
  imports: [MailersModule],
  providers: [CronService],
  exports: [CronService]
})
export class CronModule {}
