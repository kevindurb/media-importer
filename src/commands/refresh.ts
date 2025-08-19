import fs from 'node:fs/promises';
import path from 'node:path';
import { Environment } from '../Environment';
import { ImportFile } from '../models/ImportFile';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

const env = new Environment();
const importFileRepository = new ImportFileRepository();

export const refresh = async () => {
  const importsPath = env.getImportsPath();
  const fileNames = await fs.readdir(importsPath, { recursive: true });

  for (const fileName of fileNames) {
    const fullPath = path.join(importsPath, fileName);
    if ((await fs.stat(fullPath)).isDirectory()) continue;
    importFileRepository.create(new ImportFile(undefined, fullPath));
  }
};
