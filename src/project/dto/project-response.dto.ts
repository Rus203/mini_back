import { ApiProperty } from '@nestjs/swagger';
import { ProjectState } from '../entities';

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  gitLink: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  state: ProjectState;
}
