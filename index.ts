import fs from 'node:fs/promises';
import path from 'node:path';
import { choose } from './prompt';
import { TMDB } from './tmdb';

const SOURCE_DIR = process.env.SOURCE_DIR;
const MOVIES_DIR = process.env.MOVIES_DIR;
const TV_SHOWS_DIR = process.env.TV_SHOWS_DIR;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const hasConfig = !!(SOURCE_DIR && MOVIES_DIR && TV_SHOWS_DIR && TMDB_API_KEY);

if (!hasConfig) throw new Error('missing env vars');

const tmdb = new TMDB(TMDB_API_KEY);
const sourcePaths = await fs.readdir(path.resolve(import.meta.dir, SOURCE_DIR));

const sourceDirs: string[] = [];

for (const item of sourcePaths) {
  const stat = await fs.stat(item);
  if (stat.isDirectory()) sourceDirs.push(item);
}

const selectedDir = await choose(sourceDirs);
const possibleMovies = await tmdb.search(selectedDir);
