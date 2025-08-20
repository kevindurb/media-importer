import fs from 'node:fs/promises';
import path from 'node:path';
import { database } from '../Database';
import { Environment } from '../Environment';
import { ImportFile } from '../models/ImportFile';

const env = new Environment();

export class ImportFileRepository {
  private columns = {
    id: {
      type: 'TEXT PRIMARY KEY NOT NULL',
    },
    path: {
      type: 'TEXT NOT NULL UNIQUE',
    },
    tmdb_match_id: {
      alias: 'tmdbMatchId',
      type: '',
    },
    is_tv_show: {
      alias: 'isTVShow',
      type: '',
    },
    created_at: {
      type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
    },
    updated_at: {
      type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
    },
  };

  private getColumnsForSelect() {
    return Object.entries(this.columns)
      .map(([name, props]) => ('alias' in props ? `${name} as ${props.alias}` : name))
      .join(',');
  }

  init() {
    database
      .query(
        `
        CREATE TABLE IF NOT EXISTS import_files (
          ${Object.entries(this.columns)
            .map(([name, { type }]) => `${name} ${type}`)
            .join(',')}
        )
        `,
      )
      .run();
  }

  findAll(): ImportFile[] {
    return database
      .query(`SELECT ${this.getColumnsForSelect()} from import_files`)
      .as(ImportFile)
      .all();
  }

  findById(id: string): ImportFile | null {
    return database
      .query<ImportFile, string>(
        `SELECT ${this.getColumnsForSelect()} from import_files where id = ?`,
      )
      .as(ImportFile)
      .get(id);
  }

  create(importFile: ImportFile) {
    return database
      .query<ImportFile, { id: string; path: string; tmdbMatchId?: number; isTVShow?: boolean }>(
        `insert into import_files (id, path, tmdb_match_id, is_tv_show)
        values (:id, :path, :tmdbMatchId, :isTVShow)
        on conflict do nothing`,
      )
      .as(ImportFile)
      .run({
        id: importFile.id,
        path: importFile.path,
        tmdbMatchId: importFile.tmdbMatchId,
        isTVShow: importFile.isTVShow,
      });
  }

  delete(id: string) {
    return database.query<ImportFile, string>(`delete from import_files where id = ?`).run(id);
  }

  reset() {
    return database.query('delete from import_files').run();
  }

  async loadFromImportsPath() {
    this.reset();

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

        if (importFile.looksLikeTVShow()) {
          importFile.isTVShow = true;
        }

        this.create(importFile);
      } catch (error) {
        console.log('Error accessing file', fullPath, error);
      }
    }
  }

  async updateMatch(id: string, tmdbMatchId: number) {
    return database
      .query<ImportFile, { id: string; tmdbMatchId: number }>(
        `update import_files set tmdb_match_id = :tmdbMatchId where id = :id`,
      )
      .run({ id, tmdbMatchId });
  }

  async updateIsTVShow(id: string, isTVShow: boolean) {
    return database
      .query<ImportFile, { id: string; isTVShow: boolean }>(
        `update import_files set is_tv_show = :isTVShow where id = :id`,
      )
      .run({ id, isTVShow });
  }
}
