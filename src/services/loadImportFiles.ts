import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '../../generated/prisma';
import { Environment } from '../Environment';
import { buildFileImportPath } from './importFileToLibrary';
import { getMatchesForFile } from './matchFiles';

const env = new Environment();
const prisma = new PrismaClient();

export const loadFromImportsPath = async () => {
  const importsPath = env.getImportsPath();
  const paths = await fs.readdir(importsPath, { recursive: true });
  const fullPaths = paths.map((filePath) => path.join(importsPath, filePath));
  await addNewFiles(importsPath, paths);
  await removeMissingFiles(fullPaths);
};

const removeMissingFiles = async (paths: string[]) => {
  const allImportFiles = await prisma.importFile.findMany();

  for (const importFile of allImportFiles) {
    if (!paths.includes(importFile.path)) {
      console.log('Deleting missing file', importFile.path);
      await prisma.importFile.delete({ where: { id: importFile.id } });
    }
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
  const isTVShow = looksLikeTVShow(path);
  const importFile = await prisma.importFile.create({
    data: {
      path,
      isTVShow,
      season: isTVShow ? extractSeason(path) : null,
      episode: isTVShow ? extractEpisode(path) : null,
    },
  });
  const id = importFile.id;

  const matches = await getMatchesForFile(importFile);
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

const extractSeason = (path: string) => {
  const result = path.match(/S(\d+)/);
  if (!result) return;
  const [, seasonNumber] = result;
  if (seasonNumber) {
    return Number.parseInt(seasonNumber);
  }
};

const extractEpisode = (path: string) => {
  const result = path.match(/E(\d+)/);
  if (!result) return;
  const [, episodeNumber] = result;
  if (episodeNumber) {
    return Number.parseInt(episodeNumber);
  }
};
