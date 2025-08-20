import type { ImportFile } from '../../generated/prisma';
import { TMDB } from '../TMDB';
import { fileName, parentDirectory } from '../utils/files';

const searchIgnoreRegex = /[DSET]\d+/g;
const tmdb = new TMDB();

export class TMDBMatchService {
  async getMatchesForFile(importFile: ImportFile, queryOverride?: string) {
    if (queryOverride) {
      return (
        importFile.isTVShow ? tmdb.searchTV(queryOverride) : tmdb.searchMovie(queryOverride)
      ).then((res) => res.results);
    }
    return (
      await Promise.all(
        this.getMatchQueries(importFile).map((query) =>
          (importFile.isTVShow ? tmdb.searchTV(query) : tmdb.searchMovie(query)).then(
            (res) => res.results,
          ),
        ),
      )
    ).flat();
  }

  private getMatchQueries(file: ImportFile): string[] {
    const cleanFileName = this.cleanForQuery(fileName(file));
    const cleanParent = this.cleanForQuery(parentDirectory(file));

    return [cleanFileName, cleanParent];
  }

  private cleanForQuery(value: string): string {
    return value.replaceAll(/\W|_/g, ' ').replaceAll(searchIgnoreRegex, '');
  }
}
