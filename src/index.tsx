import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import qs from 'qs';
import z from 'zod';
import { PrismaClient } from '../generated/prisma';
import { assets } from './assets';
import { Environment } from './Environment';
import { IndexPage } from './pages/IndexPage';
import { MatchPage } from './pages/MatchPage';
import { buildFileImportPath, importFile } from './services/ImportFileToLibraryService';
import { loadFromImportsPath } from './services/LoadImportFilesService';

const prisma = new PrismaClient();
const env = new Environment();

const optionalParseString = z
  .string()
  .optional()
  .transform((value) => (value ? Number.parseInt(value) : undefined));

const UpdateImportFileBody = z.object({
  tmdbMatchId: optionalParseString,
  isTVShow: z
    .string()
    .optional()
    .default('0')
    .transform((value) => value === '1'),
  season: optionalParseString,
  episode: optionalParseString,
  part: optionalParseString,
});

bun.serve({
  port: env.getPort(),
  routes: {
    ...assets,
    '/health': new Response('OK'),
    '/': (req) =>
      new Response(
        renderToStream(
          <IndexPage query={new URL(req.url).searchParams.get('query') ?? undefined} />,
        ),
      ),
    '/refresh': {
      POST: async () => {
        await loadFromImportsPath();
        return Response.redirect('/');
      },
    },
    '/import-files/:id': {
      GET: (req) =>
        new Response(
          renderToStream(
            <MatchPage
              id={Number.parseInt(req.params.id)}
              tmdbQuery={new URL(req.url).searchParams.get('tmdbQuery') ?? undefined}
            />,
          ),
        ),
      POST: async (req) => {
        const id = Number.parseInt(req.params.id);
        const data = UpdateImportFileBody.parse(qs.parse(await req.text()));
        const importFile = await prisma.importFile.findUnique({
          where: { id },
        });
        if (importFile) {
          const updated = await prisma.importFile.update({
            where: { id },
            data,
          });
          const importPath = await buildFileImportPath(updated);
          await prisma.importFile.update({
            where: { id },
            data: { importPath },
          });
        }
        return Response.redirect(`/import-files/${id}`);
      },
    },
    '/import-files/:id/import': {
      POST: async (req) => {
        const id = Number.parseInt(req.params.id);
        const file = await prisma.importFile.findUnique({ where: { id } });
        if (file) {
          await importFile(file);
        }
        return Response.redirect('/');
      },
    },
  },
  error(error) {
    console.error(error);
    return new Response(`Internal Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
});

console.log(`listening on http://localhost:${env.getPort()}`);
