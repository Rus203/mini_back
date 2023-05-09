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

    const { stdout } = await promisefiedExec('free -h');
    const lines = stdout.trim().split('\n');
    const memoryInfo = lines[1].replace(/ +/g, ' ').split(' ');
    const totalMemory = memoryInfo[1];
    const usedMemory = memoryInfo[2];

    const stats = await fs.stat('/');
    const totalSpace = stats.blocks * stats.blksize;
    const usedSpace = stats.size;

    return { cpuUsage, rom: { totalSpace, usedSpace}, ram: { totalMemory, usedMemory} };
  }
}
