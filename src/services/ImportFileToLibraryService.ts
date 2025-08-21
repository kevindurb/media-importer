import { extname, join } from 'node:path';
import type { ImportFile } from '../../generated/prisma';
import { Environment } from '../Environment';
import { TMDB } from '../TMDB';

const tmdb = new TMDB();
const env = new Environment();

export const importFile = async (file: ImportFile) => {
  // TODO: import
};

export const buildFileImportPath = async (file: ImportFile): Promise<string | undefined> => {
  const tmdbMatchId = file.tmdbMatchId;
  const ext = extname(file.path);

  if (!tmdbMatchId) return;

  if (file.isTVShow) {
    const match = await tmdb.getTVDetails(tmdbMatchId);
    if (!match) return;
    const releaseDate = new Date(match.first_air_date);
    console.log(match);
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
      `${match.name} (${releaseDate.getFullYear()})`,
      `Season ${season}`,
      `${match.name} (${releaseDate.getFullYear()}) S${season}E${episode} ${episodeName} [tmdb=${tmdbMatchId}]${ext}`,
    );
  }
  const match = await tmdb.getMovieDetails(tmdbMatchId);
  if (!match) return;
  const releaseDate = new Date(match.release_date);

  return join(
    env.getLibraryTVShowsPath(),
    `${match.title} (${releaseDate.getFullYear()})`,
    `${match.title} (${releaseDate.getFullYear()}) [tmdb=${tmdbMatchId}]${file.part ? `-part-${file.part}` : ''}${ext}`,
  );
};
