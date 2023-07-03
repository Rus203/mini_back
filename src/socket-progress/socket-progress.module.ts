import { Module } from '@nestjs/common';
import { SocketProgressGateway } from './socket-progress.gateway';

@Module({
  providers: [SocketProgressGateway],
  exports: [SocketProgressGateway]
})
export class SocketProgressModule {}
