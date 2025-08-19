import { database } from '../Database';
import { ImportFile } from '../models/ImportFile';

export class ImportFileRepository {
  init() {
    database
      .query(
        `
        CREATE TABLE IF NOT EXISTS import_files (
          id TEXT PRIMARY KEY NOT NULL,
          path TEXT NOT NULL UNIQUE,
          tmdb_match_id INTEGER,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `,
      )
      .run();
  }

  findAll(): ImportFile[] {
    return database
      .query('SELECT id, path, tmdb_match_id as tmdbMatchId from import_files')
      .as(ImportFile)
      .all();
  }

  findById(id: string): ImportFile | null {
    return database
      .query<ImportFile, string>(
        'SELECT id, path, tmdb_match_id as tmdbMatchId from import_files where id = ?',
      )
      .as(ImportFile)
      .get(id);
  }

  create(importFile: ImportFile) {
    return database
      .query<ImportFile, { id: string; path: string; tmdbMatchId?: number }>(
        `insert into import_files (id, path, tmdb_match_id) values (:id, :path, :tmdbMatchId) on conflict do nothing`,
      )
      .as(ImportFile)
      .run({ id: importFile.id, path: importFile.path, tmdbMatchId: importFile.tmdbMatchId });
  }

  delete(id: string) {
    return database.query<ImportFile, string>(`delete from import_files where id = ?`).run(id);
  }
}
