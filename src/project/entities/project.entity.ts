import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}
