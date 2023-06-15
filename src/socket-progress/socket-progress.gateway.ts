import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DeleteStatus, DeployStatus } from 'src/enums';

@WebSocketGateway({ cors: '*' })
export class SocketProgressGateway {
  @WebSocketServer() server: Server;

  emitDeployStatus(status: DeployStatus, id: string) {
    this.server.emit(`progress-deploy-project-${id}`, status);
  }

  emitDeleteStatus(status: DeleteStatus, id: string) {
    this.server.emit(`progress-delete-project-${id}`, status);
  }
}
