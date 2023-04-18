import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type SendOptions = {
  to: string;
  subject: string;
  view: string;
  htmlVariables?: Record<string, unknown>;
};

@Injectable()
export abstract class BaseMailer {
  abstract viewFolderName: string;

  constructor(private mailerService: MailerService) {}

  protected async send({
    to,
    subject,
    view,
    htmlVariables
  }: SendOptions): Promise<void> {
    const mailOptions: ISendMailOptions = {
      from: process.env.GMAIL_MAILER_ADDRESS,
      to,
      subject,
      template: view + '.ejs',
      context: htmlVariables
    };
    await this.mailerService.sendMail(mailOptions);
  }
}
