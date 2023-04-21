import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  isWorking() {
    return { status: true };
  }
}
