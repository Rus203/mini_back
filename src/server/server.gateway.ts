import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { OnApplicationBootstrap } from '@nestjs/common';

const promisefiedExec = util.promisify(exec);

@WebSocketGateway({ cors: '*' })
export class ServerGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnApplicationBootstrap
{
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @WebSocketServer() server: Server;
  async sendStatus() {
    const cpu = new Promise((resolve) => cpuUsage(resolve));

    const rom = this.getRom();
    const ram = this.getRam();

    await Promise.all([cpu, rom, ram]).then(([cpu, rom, ram]) => {
      this.server.emit('message', { cpu, rom, ram });
    });
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

  handleConnection() {
    const cronTask = this.schedulerRegistry.getCronJob('statistic');
    cronTask.start();
  }

  handleDisconnect() {
    const cronTask = this.schedulerRegistry.getCronJob('statistic');
    cronTask.stop();
  }

  onApplicationBootstrap() {
    const job = new CronJob('*/1 * * * * *', () => {
      this.sendStatus();
    });

    this.schedulerRegistry.addCronJob('statistic', job);
  }
}
