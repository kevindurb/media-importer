import fs from 'node:fs/promises';
import path from 'node:path';
import { Environment } from '../Environment';
import { ImportFile } from '../models/ImportFile';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

const env = new Environment();
const importFileRepository = new ImportFileRepository();

export const refresh = async () => {
  const importsPath = env.getImportsPath();
  const paths = await fs.readdir(importsPath, { recursive: true });

  for (const filePath of paths) {
    const fileName = path.basename(filePath, path.extname(filePath));
    if (fileName.startsWith('.')) continue;
    const fullPath = path.join(importsPath, filePath);
    console.log('Checking file', fileName);

    try {
      if ((await fs.stat(fullPath)).isDirectory()) continue;
      const importFile = new ImportFile(undefined, fullPath);
      const matches = await importFile.getTMDBMatches();
      if (matches.at(0)) {
        importFile.tmdbMatchId = matches.at(0)?.id;
      }
      importFileRepository.create(importFile);
    } catch (error) {
      console.log('Error accessing file', fullPath, error);
    }
  }
};
