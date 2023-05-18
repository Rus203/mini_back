import { Module } from '@nestjs/common';
import { ServerGateway } from './server.gateway';

@Module({
  providers: [ServerGateway]
})
export class ServerModule {}
