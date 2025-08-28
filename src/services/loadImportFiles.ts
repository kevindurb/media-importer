import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '../../generated/prisma';
import { Environment } from '../Environment';
import { buildFileImportPath } from './importFileToLibrary';
import { getMatchesForFile } from './matchFiles';

const env = new Environment();
const prisma = new PrismaClient();

const readDirRecursive = async (root: string) => {
  const paths: string[] = [];

  try {
    for (const name of await fs.readdir(root)) {
      const fullPath = path.join(root, name);
      console.log('checking', fullPath);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          paths.push(fullPath);
        } else if (stat.isDirectory()) {
          paths.push(...(await readDirRecursive(fullPath)));
        }
      } catch (err) {
        console.warn('Error checking path', fullPath, err);
      }
    }
  } catch (err) {
    console.warn('Error listing path', root, err);
  }

  return paths;
};

export const loadFromImportsPath = async () => {
  const importsPath = env.getImportsPath();
  const fullPaths = await readDirRecursive(importsPath);
  await addNewFiles(importsPath, fullPaths);
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
    console.log('Checking file', fileName);

    try {
      if ((await fs.stat(filePath)).isDirectory()) continue;
      if (await prisma.importFile.findUnique({ where: { path: filePath } })) {
        console.log('Skipping since already exists', filePath);
        continue;
      }

      await createImportFileFromPath(filePath);
    } catch (error) {
      console.log('Error accessing file', filePath, error);
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
