import { database } from '../Database';
import { ImportFile } from '../models/ImportFile';

export class ImportFileRepository {
  init() {
    database
      .query(
        `CREATE TABLE IF NOT EXISTS import_files (
      id TEXT PRIMARY KEY NOT NULL,
      path TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      )
      .run();
  }

  findAll(): ImportFile[] {
    return database.query('SELECT id, path from import_files').as(ImportFile).all();
  }

  findById(id: string): ImportFile | null {
    return database
      .query<ImportFile, string>('SELECT id, path from import_files where id = ?')
      .as(ImportFile)
      .get(id);
  }

  save(importFile: ImportFile) {
    return database
      .query<ImportFile, { id: string; path: string }>(
        `insert into import_files (id, path)
        values(:id, :path)
        on conflict(id) do update set
        path = :path`,
      )
      .as(ImportFile)
      .run(importFile);
  }

  delete(id: string) {
    return database.query<ImportFile, string>(`delete from import_files where id = ?`).run(id);
  }
}
