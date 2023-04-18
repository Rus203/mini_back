import { Injectable } from '@nestjs/common';
import { BaseMailer } from './BaseMailer';

@Injectable()
export class ProjectMailer extends BaseMailer {
  viewFolderName = 'project';

  public async sendServerBrokeDownMessage(email: string, projectName: string) {
    await this.send({
      to: email,
      subject: "Project's server broke down",
      view: `${this.viewFolderName}/serverBrokeDown`,
      htmlVariables: { projectName }
    });
  }
}
