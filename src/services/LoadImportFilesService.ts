import fs from 'node:fs/promises';
import path from 'node:path';
import { type ImportFile, PrismaClient } from '../../generated/prisma';
import { Environment } from '../Environment';
import { TMDBMatchService } from './TMDBMatchService';

const env = new Environment();
const prisma = new PrismaClient();
const tmdbMatchService = new TMDBMatchService();

export class LoadImportFilesService {
  async loadFromImportsPath() {
    await prisma.importFile.deleteMany();

    const importsPath = env.getImportsPath();
    const paths = await fs.readdir(importsPath, { recursive: true });

    for (const filePath of paths) {
      const fileName = path.basename(filePath, path.extname(filePath));
      if (fileName.startsWith('.')) continue;
      const fullPath = path.join(importsPath, filePath);
      console.log('Checking file', fileName);

      try {
        if ((await fs.stat(fullPath)).isDirectory()) continue;
        const importFile = await prisma.importFile.create({
          data: {
            path: fullPath,
          },
        });

        const matches = await tmdbMatchService.getMatchesForFile(importFile);
        importFile.tmdbMatchId = matches.at(0)?.id ?? null;

        if (this.looksLikeTVShow(importFile)) {
          importFile.isTVShow = true;
        }
      } catch (error) {
        console.log('Error accessing file', fullPath, error);
      }
    }
  }

  private looksLikeTVShow(file: ImportFile) {
    // Does the path have E123 or S123
    // then we guess it might be a tv show
    return /[SE]\d+/.test(file.path);
  }
}
