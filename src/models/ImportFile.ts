import { basename, dirname, extname } from 'node:path';
import mime from 'mime-types';
import { TMDB } from '../TMDB';

const searchIgnoreRegex = /[DSET]\d+/g;
const tmdb = new TMDB();

export class ImportFile {
  constructor(
    public id = crypto.randomUUID().toString(),
    public path: string,
    public tmdbMatchId?: number,
  ) {}

  get mimeType(): string {
    return mime.lookup(this.path) || 'application/octet-stream';
  }

  get fileName(): string {
    return basename(this.path, extname(this.path));
  }

  get parentDirectory(): string {
    return dirname(this.path).split('/').at(-1) ?? '';
  }

  private get matchQueries(): string[] {
    const cleanFileName = this.cleanForQuery(this.fileName);
    const cleanParent = this.cleanForQuery(this.parentDirectory);

    console.log(cleanFileName, cleanParent);

    return [cleanFileName, cleanParent];
  }

  async getTMDBMatches() {
    return (
      await Promise.all(
        this.matchQueries.map((query) => tmdb.searchMovie(query).then((res) => res.results)),
      )
    ).flat();
  }

  private cleanForQuery(value: string): string {
    return value.replaceAll(/\W|_/g, ' ').replaceAll(searchIgnoreRegex, '');
  }
}
