import fs from 'fs';
import * as yaml from 'js-yaml';
import { parse } from 'docker-file-parser';
import { join } from 'path';

export const analyzeDockerComposeFile = (folderPath: string): number[] => {
  const filePath = join(folderPath, 'docker-compose.yml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(fileContents) as {
    services?: Record<string, { ports?: string[] }>;
  };

  const ports: number[] = [];
  for (const service of Object.values(data.services || {})) {
    if (service.ports) {
      for (const portMapping of service.ports) {
        const replacedPortMapping = portMapping.replace(
          /\${(\w+)}/g,
          (match, variable) => process.env[variable] || match
        );
        const [hostPort] = replacedPortMapping.split(':');
        const parsedHostPort = parseInt(hostPort, 10);
        if (!isNaN(parsedHostPort)) {
          ports.push(parsedHostPort);
        }
      }
    }
  }

  return ports;
};

export const analyzeDockerfile = (folderPath: string): number[] => {
  const filePath = join(folderPath, 'Dockerfile');
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
      instructionPorts = instruction.args;
    }
    for (const port of instructionPorts) {
      const replacedPort = port.replace(
        /\${(\w+)}/g,
        (match, variable) => process.env[variable] || match
      );
      const parsedPort = parseInt(replacedPort, 10);
      if (!isNaN(parsedPort)) {
        ports.push(parsedPort);
      }
    }
  }

  return ports;
};
