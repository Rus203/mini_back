import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerGateway } from './server.gateway';

@Module({
  controllers: [ServerController],
  providers: [ServerGateway]
})
export class ServerModule {}
