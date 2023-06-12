import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { Port } from '../../port/port.entity';

export enum ProjectState {
  Undeployed = 'undeployed',
  Running = 'running',
  Failed = 'failed'
}

@Entity()
export class Project {
  @ApiProperty({
    type: String
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: String
  })
  @Index()
  @Column()
  name: string;

  @ApiProperty({
    type: String
  })
  @Column({ nullable: true })
  envFile?: string;

  @ApiProperty({
    type: String
  })
  @Column()
  gitLink: string;

  @ApiProperty({
    type: String
  })
  @Column()
  uploadPath: string;

  @ApiProperty({
    type: String
  })
  @Column()
  email: string;

  @ApiProperty({
    enum: ProjectState
  })
  @Column({
    type: 'enum',
    enum: ProjectState,
    default: ProjectState.Undeployed
  })
  state: ProjectState;

  @ApiProperty({
    type: String
  })
  @Column()
  gitPrivateKeyPath: string;

  @OneToMany(() => Port, (port) => port.project)
  ports: Port[];
}
