import { Controller, Get } from '@nestjs/common';
import { ServerService } from './server.provider';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}
  @Get('status')
  async getServerStatus() {
    return await this.serverService.getStatus();
  }
}
