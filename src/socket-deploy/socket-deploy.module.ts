import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { SocketDeployGateway } from './socket-deploy.gateway';

@Module({
  imports: [ProjectModule],
  providers: [SocketDeployGateway]
})
export class SocketDeployModule {}
