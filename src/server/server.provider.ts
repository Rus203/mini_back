import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';
import * as fs from 'fs';

const promisefiedExec = util.promisify(exec);
const promiseGetCpuUsage = util.promisify(cpuUsage);

@Injectable()
export class ServerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    const cpuUsage = await promiseGetCpuUsage();
    const ram = this.getMemoryInfo();
    const rom = this.getMemoryInfo();

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

  async getDiskSpaceInfo(path: string) {
    const { blksize, blocks, bfree } = fs.statSync('/');
    const totalStorage = blksize * blocks;
    const usedStorage = blksize * (blocks - bfree);
    return { total: totalStorage, used: usedStorage };
  }
}
