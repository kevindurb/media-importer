import fs from 'node:fs/promises';
import path from 'node:path';
import { database } from '../Database';
import { Environment } from '../Environment';
import { ImportFile } from '../models/ImportFile';

const env = new Environment();

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

  async loadFromImportsPath() {
    const importsPath = env.getImportsPath();
    const paths = await fs.readdir(importsPath, { recursive: true });

    for (const filePath of paths) {
      const fileName = path.basename(filePath, path.extname(filePath));
      if (fileName.startsWith('.')) continue;
      const fullPath = path.join(importsPath, filePath);
      console.log('Checking file', fileName);

      try {
        if ((await fs.stat(fullPath)).isDirectory()) continue;
        const importFile = new ImportFile(undefined, fullPath);
        const matches = await importFile.getTMDBMatches();
        if (matches.at(0)) {
          importFile.tmdbMatchId = matches.at(0)?.id;
        }
        this.create(importFile);
      } catch (error) {
        console.log('Error accessing file', fullPath, error);
      }
    }
  }
}
