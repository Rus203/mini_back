import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './datasourceOptions';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)]
})
export class DatabaseModule {
  constructor(private dataSource: DataSource) {}
}
