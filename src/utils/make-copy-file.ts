import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export const makeCopyFile = async (originFilePath: string) => {
  const originMiniBackPrivateKeyFile = createReadStream(originFilePath);

  let newPathFile: string;
  if (originFilePath.match('.enc$')) {
    newPathFile = [
      ...originFilePath.split('.').slice(0, -1),
      Date.now(),
      Math.random() * 1000,
      'enc'
    ].join('.');
  } else {
    newPathFile = [
      ...originFilePath.split('.').slice(0, -1),
      Math.random() * 1000,
      Date.now()
    ].join('.');
  }

  const intermediateMiniBackPrivateKeyFile = createWriteStream(newPathFile);

  await pipelineAsync(
    originMiniBackPrivateKeyFile,
    intermediateMiniBackPrivateKeyFile
  );

  return newPathFile;
};
