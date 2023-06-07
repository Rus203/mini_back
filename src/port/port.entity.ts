import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { Project } from 'src/project/entities';

@Entity('ports')
export class Port {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  port: number;

  @ManyToOne(() => Project, (project) => project.ports, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;
}
