import { IsOptional } from 'class-validator';

export class AddPortDto {
  port: number;

  @IsOptional()
  projectId?: string;
}
