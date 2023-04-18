import path from 'path';

import { Module } from '@nestjs/common';
import { ProjectMailer } from './project.mailer';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          port: 465,
          secure: true,
          auth: {
            user: configService.get('GMAIL_MAILER_ADDRESS'),
            pass: configService.get('GMAIL_APP_KEY')
          }
        },
        template: {
          dir: path.join(__dirname, '..', 'views', 'mailers'),
          adapter: new EjsAdapter(),
          options: {
            strict: false
          }
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [ProjectMailer],
  exports: [ProjectMailer]
})
export class MailersModule {}
