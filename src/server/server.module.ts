import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerProvider } from './server.provider';

@Module({
  controllers: [ServerController],
  providers: [ServerProvider]
})
export class ServerModule {}
