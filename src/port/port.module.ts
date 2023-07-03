import { Module } from '@nestjs/common';
import { PortService } from './port.service';
import { Port } from './port.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Port])],
  providers: [PortService],
  exports: [PortService]
})
export class PortModule {}
