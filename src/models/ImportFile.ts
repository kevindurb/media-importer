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
}
