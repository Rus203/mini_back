import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { probe } from '@network-utils/tcp-ping';

@Injectable()
export class CronService {
  private shouldRunCronTask = false;
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
    private mailService: MailerService
  ) {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const serverPort = Number(this.configService.get<string>('SERVER_PORT'));

    const job = new CronJob(CronExpression.EVERY_5_MINUTES, () => {
      probe(serverPort, serverUrl).catch(() => {
        this.sendMail(
          'Server was broken down',
          'The server is not responding to ping requests'
        );
        this.stopTask();
      });
    });

    this.schedulerRegistry.addCronJob('check_server', job);
  }

  startTask() {
    this.shouldRunCronTask = true;
  }

  stopTask() {
    this.shouldRunCronTask = false;
  }

  async sendMail(subject: string, message: string, to = process.env.TO) {
    const mailOptions: ISendMailOptions = {
      from: process.env.GMAIL_MAILER_ADDRESS,
      to: 'slepenkov.nii@yandex.by',
      subject,
      text: message,
      template: 'project.mailer/serverBrokeDown.ejs',
      context: {
        projectName: 'test project'
      }
    };

    try {
      await this.mailService.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }
}
