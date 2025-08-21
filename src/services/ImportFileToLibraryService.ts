import type { ImportFile } from '../../generated/prisma';

export class ImportFileToLibraryService {
  async importFile(file: ImportFile) {
    this.assertFileIsReady(file);
  }

  assertFileIsReady(file: ImportFile) {
    if (!file.tmdbMatchId) throw new Error('File must have tmdb match');
    if (file.isTVShow && !(file.season && file.episode))
      throw new Error('TV Shows must have season and episode');
  }
}
