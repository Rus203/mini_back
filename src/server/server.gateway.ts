import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';
import { OnModuleInit } from '@nestjs/common';

const promisefiedExec = util.promisify(exec);

@WebSocketGateway({ cors: '*' })
export class ServerGateway implements OnModuleInit {
  @WebSocketServer() server: Server;
  @SubscribeMessage('message')
  async sendStatus() {
    const cpu = await new Promise((resolve) => cpuUsage(resolve));

    const rom = await this.getRom();
    const ram = await this.getRam();
    this.server.emit('message', { cpu, rom, ram });
  }

  async onModuleInit() {
    setInterval(() => {
      this.sendStatus();
    }, 1000);
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
