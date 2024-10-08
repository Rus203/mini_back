import { Project } from '../entities/project.entity';
import {
  IsEmail,
  IsNumberString,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateProjectDto implements Partial<Project> {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  gitLink: string;

  @IsNumberString()
  port: string;
}
