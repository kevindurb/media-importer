import { basename, extname } from 'node:path';
import mime from 'mime-types';

export class ImportFile {
  constructor(
    public id = crypto.randomUUID().toString(),
    public path: string,
    public tmdbMatchId?: number,
  ) {}

  get mimeType() {
    return mime.lookup(this.path) || 'application/octet-stream';
  }

  get fileName() {
    return basename(this.path, extname(this.path));
  }
}
