import mime from 'mime-types';

export class ImportFile {
  constructor(
    public id = crypto.randomUUID().toString(),
    public path: string,
  ) {}

  get mimeType() {
    return mime.lookup(this.path) || 'application/octet-stream';
  }
}
