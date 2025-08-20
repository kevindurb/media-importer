import { basename, dirname, extname } from 'node:path';
import mime from 'mime-types';
import type { ImportFile } from '../../generated/prisma';

export const mimeTypeForFile = (importFile: ImportFile) =>
  mime.lookup(importFile.path) || 'application/octet-stream';

export const fileName = (importFile: ImportFile) =>
  basename(importFile.path, extname(importFile.path));

export const parentDirectory = (importFile: ImportFile) =>
  dirname(importFile.path).split('/').at(-1) ?? '';
