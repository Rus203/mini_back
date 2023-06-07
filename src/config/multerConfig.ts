import crypto from 'node:crypto';
import path from 'node:path';
import { diskStorage } from 'multer';
import { Request } from 'express';

const srcPath = path.join(__dirname, '..');

export const storage = diskStorage({
  destination: path.join(srcPath, '..', 'tmp'),
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + crypto.randomBytes(20).toString('hex');
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
