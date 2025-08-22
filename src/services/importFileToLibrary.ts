import * as fs from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { mkdirp } from 'mkdirp';
import type { ImportFile } from '../../generated/prisma';
import { PrismaClient } from '../../generated/prisma';
import { Environment } from '../Environment';
import { TMDB } from '../TMDB';

const tmdb = new TMDB();
const env = new Environment();
const prisma = new PrismaClient();

export const importFile = async (file: ImportFile) => {
  if (!file.tmdbMatchId) throw new Error('Must have match');
  if (!file.importPath) throw new Error('Must have import path');

  console.log('Creating intermediate directories');
  await mkdirp(dirname(file.importPath));
  console.log('Moving file');
  await fs.rename(file.path, file.importPath);
  console.log('Done moving file');

  await prisma.importFile.delete({ where: { id: file.id } });
};

export const buildFileImportPath = async (file: ImportFile): Promise<string | undefined> => {
  const tmdbMatchId = file.tmdbMatchId;
  const ext = extname(file.path);

  if (!tmdbMatchId) return;

  if (file.isTVShow) {
    const match = await tmdb.getTVDetails(tmdbMatchId);
    if (!match) return;
    const releaseDate = new Date(match.first_air_date);
    const season = file.season?.toString().padStart(2, '0') ?? '00';
    const episode = file.episode?.toString().padStart(2, '0') ?? '00';
    let episodeName = 'Unnamed';
    if (file.season && file.episode) {
      const seasonDetails = await tmdb.getTVSeasonDetails(tmdbMatchId, file.season);
      const episodeDetails = seasonDetails?.episodes.find(
        ({ episode_number }) => episode_number === file.episode,
      );
      if (episodeDetails) {
        episodeName = episodeDetails.name;
      }
    }
    return join(
      env.getLibraryTVShowsPath(),
      `${match.name} (${releaseDate.getFullYear()}) [tmdb=${tmdbMatchId}]`,
      `Season ${season}`,
      `${match.name} (${releaseDate.getFullYear()}) S${season}E${episode} ${episodeName} [tmdb=${tmdbMatchId}]${ext}`,
    );
  }
  const match = await tmdb.getMovieDetails(tmdbMatchId);
  if (!match) return;
  const releaseDate = new Date(match.release_date);

  return join(
    env.getLibraryMoviesPath(),
    `${match.title} (${releaseDate.getFullYear()}) [tmdb=${tmdbMatchId}]`,
    `${match.title} (${releaseDate.getFullYear()}) [tmdb=${tmdbMatchId}]${file.part ? `-part-${file.part}` : ''}${ext}`,
  );
};
