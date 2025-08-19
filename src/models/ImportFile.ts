export class ImportFile {
  constructor(
    public id = crypto.randomUUID().toString(),
    public path: string,
  ) {}
}
