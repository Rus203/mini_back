import { HttpException } from '@nestjs/common';

export const handleServiceErrors = (err: any) => {
  if (typeof err === 'string') {
    throw new HttpException(err, 400);
  }

  if (typeof err === 'object' && 'message' in err) {
    throw new HttpException(err.message, 400);
  }

  throw new HttpException('Unexpected exception', 500);
};
