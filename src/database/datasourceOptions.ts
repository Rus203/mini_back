import { DataSourceOptions } from 'typeorm';
import { Project } from '../project/entities';
import { Port } from 'src/port/port.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST!,
  port: Number(process.env.POSTGRES_PORT!),
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  entities: [Project, Port],
  synchronize: true
};

export default dataSourceOptions;
