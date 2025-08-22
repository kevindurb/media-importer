import type { ImportFile } from '../../generated/prisma';
import { TMDB } from '../TMDB';
import { fileName, parentDirectory } from '../utils/files';

const searchIgnoreRegex = /[DSET]\d+/g;
const tmdb = new TMDB();

export const getMatchesForQuery = async (query: string, isTVShow: boolean) => {
  const res = await (isTVShow ? tmdb.searchTV(query) : tmdb.searchMovie(query));
  return res?.results ?? [];
};

export const getMatchesForFile = async (importFile: ImportFile) => {
  return (
    await Promise.all(
      getMatchQueries(importFile).map((query) =>
        (importFile.isTVShow ? tmdb.searchTV(query) : tmdb.searchMovie(query)).then(
          (res) => res?.results ?? [],
        ),
      ),
    )
  ).flat();
};

const getMatchQueries = (file: ImportFile): string[] => {
  const cleanFileName = cleanForQuery(fileName(file));
  const cleanParent = cleanForQuery(parentDirectory(file));

  return [cleanFileName, cleanParent];
};

const cleanForQuery = (value: string): string => {
  return value.replaceAll(/\W|_/g, ' ').replaceAll(searchIgnoreRegex, '');
};
