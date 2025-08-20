import fs from 'node:fs/promises';
import path from 'node:path';
import { Environment } from '../Environment';
import { ImportFile } from '../models/ImportFile';
import { ImportFileRepository } from '../repositories/ImportFileRepository';
import { TMDB } from '../TMDB';

const env = new Environment();
const importFileRepository = new ImportFileRepository();
const tmdb = new TMDB();

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
      const match = await findMatchForImportFile(importFile);
      if (match) {
        importFile.tmdbMatchId = match.id;
      }
      importFileRepository.create(importFile);
    } catch (error) {
      console.log('Error accessing file', fullPath, error);
    }
  }
};

export const findMatchForImportFile = async (importFile: ImportFile) => {
  // TODO: use a more complex algorithm to find matches
  const searchTerm = importFile.fileName.replaceAll(/\W/g, ' ');
  const { results: matches } = await tmdb.searchMovie(searchTerm);
  if (matches.length) {
    return matches.at(0);
  }
  return null;
};
