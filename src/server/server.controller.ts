import { Controller, Get } from '@nestjs/common';
import { ServerProvider } from './server.provider';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerProvider) {}
  @Get('status')
  async getServerStatus() {
    return await this.serverService.getStatus();
  }
}
