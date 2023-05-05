import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ProjectState {
  UNDEPLOYED = 'undeployed',
  DEPLOYED = 'deployed',
  FAILED = 'failed',
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
  @Column({ unique: true })
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
    type: String
  })
  @Column()
  port: string;

  @ApiProperty({
    enum: ProjectState
  })
  @Column({
    type: 'enum',
    enum: ProjectState,
    default: ProjectState.UNDEPLOYED
  })
  state: ProjectState;
}
