import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';

const promisefiedExec = util.promisify(exec);

@Injectable()
export class ServerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    const cpu = await new Promise((resolve) => cpuUsage(resolve));

    const rom = await this.getRom();
    const ram = await this.getRam();

    return {
      cpuUsage: cpu,
      rom,
      ram
    };
  }

  async getRam() {
    const { stdout } = await promisefiedExec('free -h');

    const lines = stdout.trim().split('\n');
    const memoryInfo = lines[1].replace(/ +/g, ' ').split(' ');
    const totalMemory = memoryInfo[1];
    const usedMemory = memoryInfo[2];
    return { totalMemory, usedMemory };
  }

  async getRom() {
    const { stdout } = await promisefiedExec('df -h');

    const lines = stdout.trim().split('\n');
    const diskInfo = lines[1].replace(/ +/g, ' ').split(' ');
    const totalSpace = diskInfo[1];
    const usedSpace = diskInfo[2];
    return { totalSpace, usedSpace };
  }
}
