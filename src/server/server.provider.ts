import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';
import * as fs from 'fs/promises';

const promisefiedExec = util.promisify(exec);
const promiseGetCpuUsage = util.promisify(cpuUsage);

@Injectable()
export class ServerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    const cpuUsage = await promiseGetCpuUsage();
    const ram = this.getMemoryInfo();
    const rom = this.getDiskSpaceInfo();

    return { cpuUsage, rom, ram };
  }

  async getMemoryInfo() {
    const { stdout } = await promisefiedExec('free -h');

    const lines = stdout.trim().split('\n');
    const memoryInfo = lines[1].replace(/ +/g, ' ').split(' ');

    const totalMemory = memoryInfo[1];
    const usedMemory = memoryInfo[2];

    return { totalMemory, usedMemory };
  }

  async getDiskSpaceInfo() {
    const stats = await fs.stat('/');
    const totalSpace = stats.blocks * stats.blksize;
    const usedSpace = stats.size;

    return { totalSpace, usedSpace}
  }
}
