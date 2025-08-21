import { basename, dirname, extname, relative } from 'node:path';
import mime from 'mime-types';
import type { ImportFile } from '../../generated/prisma';
import { Environment } from '../Environment';

const env = new Environment();

export const mimeTypeForFile = (importFile: ImportFile) =>
  mime.lookup(importFile.path) || 'application/octet-stream';

export const fileName = (importFile: ImportFile) =>
  basename(importFile.path, extname(importFile.path));

export const parentDirectory = (importFile: ImportFile) =>
  dirname(importFile.path).split('/').at(-1) ?? '';

export const fromImportPath = (importFile: ImportFile) =>
  relative(env.getImportsPath(), importFile.path);
