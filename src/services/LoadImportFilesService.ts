import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '../../generated/prisma';
import { Environment } from '../Environment';
import { buildFileImportPath } from './ImportFileToLibraryService';
import { TMDBMatchService } from './TMDBMatchService';

const env = new Environment();
const prisma = new PrismaClient();
const tmdbMatchService = new TMDBMatchService();

export const loadFromImportsPath = async () => {
  const importsPath = env.getImportsPath();
  const paths = await fs.readdir(importsPath, { recursive: true });
  await addNewFiles(importsPath, paths);
  await removeMissingFiles(paths);
};

const removeMissingFiles = async (paths: string[]) => {
  const allImportFiles = await prisma.importFile.findMany();

  for (const importFile of allImportFiles) {
    if (!paths.includes(importFile.path))
      await prisma.importFile.delete({ where: { id: importFile.id } });
  }
};

const addNewFiles = async (importsPath: string, paths: string[]) => {
  for (const filePath of paths) {
    const fileName = path.basename(filePath, path.extname(filePath));
    if (fileName.startsWith('.')) continue;
    const fullPath = path.join(importsPath, filePath);
    console.log('Checking file', fileName);

    try {
      if ((await fs.stat(fullPath)).isDirectory()) continue;
      if (await prisma.importFile.findUnique({ where: { path: fullPath } })) {
        console.log('Skipping since already exists', filePath);
        continue;
      }

      await createImportFileFromPath(fullPath);
    } catch (error) {
      console.log('Error accessing file', fullPath, error);
    }
  }
};

const createImportFileFromPath = async (path: string) => {
  const importFile = await prisma.importFile.create({
    data: {
      path,
      isTVShow: looksLikeTVShow(path),
    },
  });
  const id = importFile.id;

  const matches = await tmdbMatchService.getMatchesForFile(importFile);
  await prisma.importFile.update({
    where: { id },
    data: { tmdbMatchId: matches.at(0)?.id ?? null },
  });
  importFile.tmdbMatchId = matches.at(0)?.id ?? null;

  const importPath = await buildFileImportPath(importFile);
  if (importPath) {
    await prisma.importFile.update({
      where: { id },
      data: { importPath },
    });
  }
};

const looksLikeTVShow = (path: string) => {
  // Does the path have E123 or S123
  // then we guess it might be a tv show
  return /[SE]\d+/.test(path);
};
