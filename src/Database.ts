import { Database } from 'bun:sqlite';

export const database = new Database('./database.sqlite', { strict: true });
