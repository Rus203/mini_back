import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Injectable()
export class ServerService {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    // try to add ping to a project later
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMem = totalMemory - freeMemory;
    const cpuLoad = os.loadavg()[0];

    return { totalMemory, freeMemory, usedMem, cpuLoad };
  }
}
