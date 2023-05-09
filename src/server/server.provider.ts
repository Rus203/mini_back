import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import util from 'util';
import { exec } from 'child_process';
import * as os from 'os';

const promisifiedExec = util.promisify(exec);

@Injectable()
export class ServerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    const { stdout: memoryOutput } = await promisifiedExec('free -h');
    const [unused, ...memoryInfo] = memoryOutput.trim().split('\n');
    const [totalMemory, usedMemory, freeMemory] = memoryInfo[0]
      .split(/\s+/)
      .slice(1);

    const { stdout: diskOutput } = await promisifiedExec('df -h');
    const [notNeeded, ...diskInfo] = diskOutput.trim().split('\n');
    const [totalDisk, usedDisk, freeDisk] = diskInfo[0].split(/\s+/);

    const cpuUsage = os.loadavg()[0];

    return {
      totalMemory,
      freeMemory,
      usedMemory,
      totalDisk,
      usedDisk,
      freeDisk,
      cpuUsage
    };
  }
}
