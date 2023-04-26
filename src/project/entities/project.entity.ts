import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  envFile: string;

  @Column()
  gitLink: string;

  @Column()
  uploadPath: string;

  @Column()
  email: string;

  @Column()
  port: string;

  @Column({ default: false })
  isDeployed: boolean;
}
