export class Environment {
  getImportsPath(): string {
    return this.getStringOrFail('IMPORTS_PATH');
  }

  getLibraryMoviesPath(): string {
    return this.getStringOrFail('LIBRARY_MOVIES_PATH');
  }

  getLibraryTVShowsPath(): string {
    return this.getStringOrFail('LIBRARY_TV_SHOWS_PATH');
  }

  getPort(): number {
    return this.getNumberOrFail('PORT');
  }

  getTMDBApiKey(): string {
    return this.getStringOrFail('TMDB_API_KEY');
  }

  private getNumberOrFail(key: string): number {
    const value = this.getStringOrFail(key);
    const parsed = Number.parseInt(value);
    if (Number.isNaN(parsed)) throw new Error(`Failed to parse env ${key}`);
    return parsed;
  }

  private getStringOrFail(key: string): string {
    const value = process.env[key];
    if (typeof value !== 'string') throw new Error(`Failed to get env ${key}`);
    return value;
  }
}
