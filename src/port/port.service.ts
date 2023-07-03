import { Injectable, OnModuleInit } from '@nestjs/common';
import { Port } from './port.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPortDto } from './dto/get-ports.dto';

import {
  analyzeDockerfile,
  checkPortAvailability,
  analyzeDockerComposeFile
} from 'src/utils';
import { join } from 'path';
import { AddPortDto } from './dto/add-ports.dto';

@Injectable()
export class PortService implements OnModuleInit {
  constructor(
    @InjectRepository(Port)
    private readonly projectRepository: Repository<Port>
  ) {}

  async onModuleInit() {
    const projectPath = join(__dirname, '..', '..');
    const ports = [
      ...analyzeDockerfile(projectPath),
      ...analyzeDockerComposeFile(projectPath)
    ];

    const promises = ports.map(async (item) => {
      const port = await this.getPorts({ port: item });
      const result = checkPortAvailability(item);
      if (port.length === 0 && result) {
        return this.addPort({ port: item });
      }
    });

    await Promise.all(promises);
  }

  async addPort(dto: AddPortDto) {
    const ports = await this.getPorts(dto);
    console.log(ports);
    if (ports.length > 0) {
      throw new Error('Not available port: ' + dto.port);
    }

    const newPort = this.projectRepository.create(dto);
    return this.projectRepository.save(newPort);
  }

  async removePort(id: string) {
    return this.projectRepository.delete({ id });
  }

  async getPorts(dto: GetPortDto) {
    return this.projectRepository.findBy(dto);
  }
}
