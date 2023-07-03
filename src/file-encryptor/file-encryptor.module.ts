import { Module } from '@nestjs/common';
import { FileEncryptorProvider } from './file-encryptor.provider';

@Module({
  providers: [FileEncryptorProvider],
  exports: [FileEncryptorProvider]
})
export class FileEncryptorModule {}
