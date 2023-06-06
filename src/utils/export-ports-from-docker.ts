import fs from 'fs';
import * as yaml from 'js-yaml';
import { parse } from 'docker-file-parser';

export const analyzeDockerComposeFile = (filePath: string): number[] => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const data = yaml.load(fileContents) as {
      services?: Record<string, { ports?: string[] }>;
    };

    const ports: number[] = [];
    for (const service of Object.values(data.services || {})) {
      if (service.ports) {
        for (const portMapping of service.ports) {
          const [hostPort] = portMapping.split(':');
          ports.push(parseInt(hostPort, 10));
        }
      }
    }

    return ports;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const analyzeDockerfile = (filePath: string): number[] => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const dockerfile = parse(fileContents);

    const ports: number[] = [];
    const exposeInstructions = dockerfile.filter(
      (instruction) => instruction.name === 'EXPOSE'
    );
    for (const instruction of exposeInstructions) {
      let instructionPorts: string[] = [];
      if (typeof instruction.args === 'string') {
        instructionPorts = instruction.args.split(' ');
      } else if (Array.isArray(instruction.args)) {
        instructionPorts = instruction.args.flatMap((port) => port.split(':'));
      }
      for (const port of instructionPorts) {
        ports.push(parseInt(port, 10));
      }
    }

    return ports;
  } catch (e) {
    console.log(e);
    return [];
  }
};

// const dockerComposeFilePath = './projects/project-master/docker-compose.yml';
// const dockerfilePath = './projects/project-master/Dockerfile';

// const dockerComposePorts = analyzeDockerComposeFile(dockerComposeFilePath);
// console.log('Ports from docker-compose.yml:', dockerComposePorts);

// const dockerfilePorts = analyzeDockerfile(dockerfilePath);
// console.log('Ports from Dockerfile:', dockerfilePorts);
