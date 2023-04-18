import { Module } from '@nestjs/common';
import { GitProvider } from './git.provider';

@Module({
  providers: [GitProvider],
  exports: [GitProvider],
})
export class GitModule {}
