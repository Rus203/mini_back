import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';
import { ProjectService } from '../project/project.service';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class SocketDeployGateway {
  constructor(private projectService: ProjectService) {}
  @WebSocketServer() server: Server;

  @SubscribeMessage('deploy-project')
  async runDeploy(@MessageBody() data) {
    console.log(data);
    console.log('start deploy a project');
    this.projectService
      .run(data.id)
      .then(() => {
        console.log('finish deploy project');
        this.server.emit(`finish-deploy-project-${data.id}`);
      })
      .catch((error) => {
        console.log('An error was gotten: ', error);
        this.server.emit('error', error.message);
      });
  }

  @SubscribeMessage('delete-project')
  deleteProject(@MessageBody() data) {
    console.log(data);
    console.log('start deleting a project');
    this.projectService
      .delete(data.id)
      .then(() => {
        console.log('Project was deleted');
        this.server.emit(`finish-delete-project-${data.id}`);
      })
      .catch((error) => {
        console.log('Error was gotten: ', error);
        this.server.emit('error', error.message);
      });
  }
}
