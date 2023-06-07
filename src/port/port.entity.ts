import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ports')
export class Port {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  port: number;
}
