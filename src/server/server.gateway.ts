import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import util from 'util';
import { exec } from 'child_process';
import { cpuUsage } from 'os-utils';

const promisefiedExec = util.promisify(exec);

@WebSocketGateway({ cors: true, port: 3010 })
export class ServerGateway {
  server: Server;
  @SubscribeMessage('message')
  async getStatus() {
    const cpu = await new Promise((resolve) => cpuUsage(resolve));

    const rom = await this.getRom();
    const ram = await this.getRam();

    this.server.emit('message', {
      cpu,
      rom,
      ram
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
}
