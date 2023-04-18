import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { probe } from '@network-utils/tcp-ping';
import * as os from 'os';

@Injectable()
export class ServerService {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const serverPort = Number(this.configService.get<string>('SERVER_PORT'));

    const isServerWorked = await probe(serverPort, serverUrl);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    return { totalMemory, freeMemory, isServerWorked };
  }
}
