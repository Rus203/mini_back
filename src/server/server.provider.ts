import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

@Injectable()
export class ServerProvider {
  constructor(private readonly configService: ConfigService) {}

  async getStatus() {
    try {
      const { stdout: memoryOutput } = await exec('free -h');
      const [unused, ...memoryInfo] = memoryOutput.trim().split('\n');
      const [totalMemory, usedMemory, freeMemory] = memoryInfo[0].split(/\s+/).slice(1);
  
      const { stdout: diskOutput } = await exec('df -h');
      const [notNeeded, ...diskInfo] = diskOutput.trim().split('\n');
      const [filesystem, totalDisk, usedDisk, freeDisk] = diskInfo[0].split(/\s+/);
  
      return {
        totalMemory,
        usedMemory,
        freeMemory,
        totalDisk,
        usedDisk,
        freeDisk,
      };
  }
}
